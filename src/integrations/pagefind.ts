// ---------------------------------------------------------------------------
// Pagefind integration for Astro
//
// Dev:  Creates an in-memory Pagefind index, pre-crawls the running dev
//       server, serves /pagefind/* via Connect middleware, and re-crawls
//       when pages or content files change.
//
// Prod: Indexes the built output directory on disk and writes the compiled
//       Pagefind bundle alongside it.
// ---------------------------------------------------------------------------

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration, AstroIntegrationLogger } from "astro";
import type { IndexFile, PagefindIndex } from "pagefind";

// ── MIME ───────────────────────────────────────────────────────────

const MIME: Record<string, string> = {
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
};

function mimeFor(filePath: string): string {
  return (
    MIME[path.extname(filePath).toLowerCase()] ?? "application/octet-stream"
  );
}

// ── Debounce ───────────────────────────────────────────────────────

function debounce(fn: () => void, ms: number): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(fn, ms);
  };
}

// ── URL discovery ──────────────────────────────────────────────────

function walkDir(dir: string): string[] {
  const out: string[] = [];
  try {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        out.push(...walkDir(full));
      } else {
        out.push(full);
      }
    }
  } catch {
    // Directory doesn't exist or isn't readable — that's fine.
  }
  return out;
}

/** Strip file extensions and a trailing /index segment to produce a URL path. */
function toUrlPath(
  rel: string,
  extPattern: RegExp,
  opts?: { skipDynamic?: boolean },
): string | null {
  if (opts?.skipDynamic && rel.startsWith("[")) return null;
  if (!extPattern.test(rel)) return null;

  let url = rel.replace(extPattern, "");
  url = url.replace(/\/index$/, "");
  if (url === "") return "/";
  if (!url.startsWith("/")) url = `/${url}`;
  return url;
}

/** Discover all page URLs by walking the source tree. */
function discoverUrls(srcDir: URL): string[] {
  const pagesDir = fileURLToPath(new URL("pages/", srcDir));
  const contentDir = fileURLToPath(new URL("content/", srcDir));
  const urls = new Set<string>();

  // Static pages (skip dynamic routes like [slug].astro).
  for (const file of walkDir(pagesDir)) {
    const url = toUrlPath(path.relative(pagesDir, file), /\.(astro|mdx?)$/, {
      skipDynamic: true,
    });
    if (url) urls.add(url);
  }

  // Content collections — each subdirectory of content/ is a collection.
  // Walk each one to discover slugs served by catch-all routes.
  let collections: string[] = [];
  try {
    collections = fs
      .readdirSync(contentDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => path.join(contentDir, e.name));
  } catch {
    // No content directory — that's fine.
  }

  for (const colDir of collections) {
    for (const file of walkDir(colDir)) {
      const slug = toUrlPath(path.relative(colDir, file), /\.(mdx?)$/);
      if (slug) urls.add(slug);
    }
  }

  return [...urls].sort();
}

// ── Integration ────────────────────────────────────────────────────

export default function pagefind(): AstroIntegration {
  const state = {
    srcDir: null as URL | null,
    port: 4321,
    index: null as PagefindIndex | null,
    /** Pagefind runtime bundle + search index fragments. Set by ensureIndex
     *  (runtime files), then updated by crawlAll (adds index fragments). */
    files: null as Map<string, Uint8Array> | null,
    /** Resolves when the current crawl finishes. The middleware awaits this
     *  so it never serves a stale bundle mid-crawl. */
    preCrawlDone: Promise.resolve() as Promise<void>,
  };

  // ── Pagefind lifecycle ──────────────────────────────────────────

  async function ensureIndex(): Promise<PagefindIndex> {
    if (!state.index) {
      const pagefind = await import("pagefind");
      const result = await pagefind.createIndex({
        forceLanguage: "no",
        verbose: false,
      });
      if (result.errors?.length) {
        throw new Error(`Pagefind createIndex: ${result.errors.join(", ")}`);
      }
      if (!result.index) {
        throw new Error("Pagefind createIndex returned no index");
      }
      state.index = result.index;

      // Load the runtime bundle (pagefind.js, wasm, css, etc.).
      const { files } = await state.index.getFiles();
      state.files = new Map(files.map((f: IndexFile) => [f.path, f.content]));
    }
    return state.index;
  }

  // ── Dev: crawl & index ──────────────────────────────────────────

  async function crawlAll(
    baseUrl: string,
    logger: AstroIntegrationLogger,
  ): Promise<void> {
    if (!state.srcDir) {
      logger.warn("Pagefind: srcDir not set — skipping crawl");
      return;
    }
    const urls = discoverUrls(state.srcDir);
    logger.info(`Pagefind: crawling ${urls.length} routes…`);

    const idx = await ensureIndex();
    let indexed = 0;

    for (const url of urls) {
      try {
        const resp = await fetch(`${baseUrl}${url}`);
        if (!resp.ok) {
          logger.warn(`Pagefind: ${url} → ${resp.status}, skipping`);
          continue;
        }
        const html = await resp.text();
        const result = await idx.addHTMLFile({ url, content: html });
        if (result.errors?.length) {
          logger.warn(
            `Pagefind: errors indexing ${url}: ${result.errors.join(", ")}`,
          );
          continue;
        }
        indexed++;
      } catch (err) {
        logger.warn(
          `Pagefind: failed to fetch ${url}: ${(err as Error).message}`,
        );
      }
    }

    const { files } = await idx.getFiles();
    state.files = new Map(files.map((f: IndexFile) => [f.path, f.content]));

    logger.info(`Pagefind: indexed ${indexed}/${urls.length} pages`);
  }

  // ── Hooks ───────────────────────────────────────────────────────

  return {
    name: "pagefind",
    hooks: {
      "astro:config:done": ({ config }) => {
        state.srcDir = config.srcDir;
      },

      "astro:server:setup": async ({ server, logger }) => {
        // 1. Warm up the Pagefind binary and load the runtime bundle.
        try {
          await ensureIndex();
          logger.info(
            `Pagefind dev index ready (${state.files?.size ?? 0} bundle files)`,
          );
        } catch (err) {
          logger.error("Pagefind unavailable — search will not work in dev");
          logger.error((err as Error).message);
          return;
        }

        // 2. Serve /pagefind/* from the in-memory bundle.
        //
        //    We deliberately avoid the path-prefix form of
        //    `server.middlewares.use("/pagefind", …)` because Connect strips
        //    the prefix from req.url, which breaks nested paths like
        //    /pagefind/fragment/…
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith("/pagefind")) return next();

          try {
            await state.preCrawlDone;

            const filePath =
              req.url.split("?")[0].replace(/^\/pagefind\/?/, "") ||
              "pagefind.js";

            const content = state.files?.get(filePath);

            if (content) {
              res.setHeader("Content-Type", mimeFor(filePath));
              res.setHeader("Content-Length", content.byteLength);
              res.setHeader("Cache-Control", "no-cache");
              res.end(Buffer.from(content));
              return;
            }

            logger.warn(
              `Pagefind: file not in bundle: "${filePath}" ` +
                `(available: ${state.files ? [...state.files.keys()].join(", ") : "(none)"})`,
            );
          } catch (err) {
            logger.error(`Pagefind serve error: ${(err as Error).message}`);
          }
          next();
        });

        // 3. Re-crawl when pages or content files change.
        const scheduleRecrawl = debounce(() => {
          state.preCrawlDone = crawlAll(
            `http://localhost:${state.port}`,
            logger,
          );
        }, 500);

        if (state.srcDir) {
          const pagesDir = fileURLToPath(new URL("pages/", state.srcDir));
          const contentDir = fileURLToPath(new URL("content/", state.srcDir));

          const onPageChange = (p: string) => {
            if (p.startsWith(pagesDir) || p.startsWith(contentDir)) {
              scheduleRecrawl();
            }
          };
          server.watcher.on("change", onPageChange);
          server.watcher.on("add", onPageChange);
          server.watcher.on("unlink", onPageChange);
        }
      },

      "astro:server:start": async ({ address, logger }) => {
        state.port = address?.port ?? 4321;
        state.preCrawlDone = crawlAll(`http://localhost:${state.port}`, logger);
      },

      "astro:build:done": async ({ dir, logger }) => {
        const outDir = fileURLToPath(dir);
        logger.info(`Pagefind: indexing ${outDir}…`);

        const idx = await ensureIndex();

        const { page_count, errors: addErrors } = await idx.addDirectory({
          path: outDir,
        });

        if (addErrors.length) {
          logger.error("Pagefind: failed to index files");
          for (const err of addErrors) logger.error(err);
          return;
        }

        logger.info(`Pagefind: indexed ${page_count} pages`);

        const { outputPath, errors: writeErrors } = await idx.writeFiles({
          outputPath: path.join(outDir, "pagefind"),
        });

        if (writeErrors.length) {
          logger.error("Pagefind: failed to write index");
          for (const err of writeErrors) logger.error(err);
          return;
        }

        logger.info(`Pagefind: wrote index to ${outputPath}`);
      },
    },
  };
}
