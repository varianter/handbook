// ---------------------------------------------------------------------------
// Pagefind dev-mode integration for Astro
//
// Replaces the need for `pagefind --site dist` during `astro dev`. Uses the
// Node API to build an in-memory index, serves the /pagefind/* bundle from
// the Vite dev server, and pre-crawls all known routes on startup.
//
// Production builds are untouched — they still use `pagefind --site dist`.
// ---------------------------------------------------------------------------
import type { AstroIntegration, AstroIntegrationLogger } from "astro";
import type { PagefindIndex, IndexFile } from "pagefind";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ── MIME ───────────────────────────────────────────────────────────
// Pure helpers — no mutable state.

const MIME: Record<string, string> = {
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
};

function mimeFor(filePath: string): string {
  return MIME[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

// ── URL discovery ──────────────────────────────────────────────────

function walkDir(dir: string, logger?: AstroIntegrationLogger): string[] {
  const out: string[] = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        out.push(...walkDir(full, logger));
      } else {
        out.push(full);
      }
    }
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") {
      logger?.warn(
        `Pagefind: could not read ${dir}: ${(err as Error).message}`,
      );
    }
  }
  return out;
}

/**
 * Strip file extension(s) and a trailing /index segment from a relative
 * path to produce a URL path.  Returns null if the file isn't a recognised
 * page type.
 */
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
  if (!url.startsWith("/")) url = "/" + url;
  return url;
}

function discoverUrls(srcDir: URL): string[] {
  const pagesDir = fileURLToPath(new URL("pages/", srcDir));
  const contentDir = fileURLToPath(new URL("content/handbook/", srcDir));
  const urls = new Set<string>();

  for (const file of walkDir(pagesDir)) {
    const url = toUrlPath(path.relative(pagesDir, file), /\.(astro|mdx?)$/, {
      skipDynamic: true,
    });
    if (url) urls.add(url);
  }

  // Content collection files (served by [...slug].astro at /<slug>)
  for (const file of walkDir(contentDir)) {
    const slug = toUrlPath(path.relative(contentDir, file), /\.(mdx?)$/);
    if (slug) urls.add(slug);
  }

  return [...urls].sort();
}

// ── Debounce ───────────────────────────────────────────────────────

function debounce(fn: () => void, ms: number): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(fn, ms);
  };
}

// ── Integration ────────────────────────────────────────────────────

export function pagefindDev(): AstroIntegration {
  // All mutable state lives inside the integration closure — nothing leaks
  // at module scope.

  let srcDir: URL | null = null;
  let index: PagefindIndex | null = null;
  let filesCache: Map<string, Uint8Array> | null = null;

  // Promise that resolves once the initial pre-crawl finishes.
  // The /pagefind middleware awaits this so it never serves a stale bundle
  // while the pre-crawl is still running.
  let preCrawlDone: Promise<void> = Promise.resolve();
  let devPort = 4321;

  // ── pagefind lifecycle ──────────────────────────────────────────

  async function getIndex(): Promise<PagefindIndex> {
    if (!index) {
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
      index = result.index;
    }
    return index;
  }

  async function getFiles(): Promise<Map<string, Uint8Array>> {
    if (!filesCache) {
      const idx = await getIndex();
      const result = await idx.getFiles();
      if (result.errors?.length) {
        throw new Error(`Pagefind getFiles: ${result.errors.join(", ")}`);
      }
      filesCache = new Map(
        result.files.map((f: IndexFile) => [f.path, f.content]),
      );
    }
    return filesCache;
  }

  // ── indexing ────────────────────────────────────────────────────

  async function indexPage(
    url: string,
    html: string,
    logger: AstroIntegrationLogger,
  ): Promise<boolean> {
    try {
      const idx = await getIndex();
      const result = await idx.addHTMLFile({ url, content: html });
      if (result.errors?.length) {
        logger.warn(
          `Pagefind: errors indexing ${url}: ${result.errors.join(", ")}`,
        );
        return false;
      }
      return true;
    } catch (err) {
      logger.warn(
        `Pagefind: failed to index ${url}: ${(err as Error).message}`,
      );
      return false;
    }
  }

  async function crawlAll(
    baseUrl: string,
    logger: AstroIntegrationLogger,
  ): Promise<void> {
    if (!srcDir) {
      logger.warn("Pagefind: srcDir not set — skipping pre-crawl");
      return;
    }
    const urls = discoverUrls(srcDir);
    logger.info(`Pagefind: pre-crawling ${urls.length} routes…`);

    let indexed = 0;
    for (const url of urls) {
      try {
        const resp = await fetch(`${baseUrl}${url}`);
        if (!resp.ok) {
          logger.warn(`Pagefind: ${url} → ${resp.status}, skipping`);
          continue;
        }
        const html = await resp.text();
        if (await indexPage(url, html, logger)) indexed++;
      } catch (err) {
        logger.warn(
          `Pagefind: failed to fetch ${url}: ${(err as Error).message}`,
        );
      }
    }

    filesCache = null;
    logger.info(`Pagefind: indexed ${indexed}/${urls.length} pages`);
  }

  // ── hooks ───────────────────────────────────────────────────────

  return {
    name: "pagefind-dev",
    hooks: {
      "astro:config:done": ({ config }) => {
        srcDir = config.srcDir;
      },

      "astro:server:setup": async ({ server, logger }) => {
        // 1. Warm up the Pagefind binary.
        try {
          await getIndex();
          const files = await getFiles();
          logger.info(`Pagefind dev index ready (${files.size} bundle files)`);
        } catch (err) {
          logger.error("Pagefind unavailable — search will not work in dev");
          logger.error((err as Error).message);
          return;
        }

        // 2. Serve /pagefind/* from the in-memory index.
        //
        //    We deliberately avoid the path-prefix form of
        //    `server.middlewares.use("/pagefind", …)` because Connect strips
        //    the prefix from req.url, which breaks nested paths like
        //    /pagefind/fragment/…
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith("/pagefind")) return next();

          try {
            // Wait for the pre-crawl to finish before serving files.
            // This guarantees the bundle is complete.
            await preCrawlDone;

            const filePath =
              req.url.split("?")[0].replace(/^\/pagefind\/?/, "") ||
              "pagefind.js";

            const files = await getFiles();
            const content = files.get(filePath);

            if (content) {
              res.setHeader("Content-Type", mimeFor(filePath));
              res.setHeader("Content-Length", content.byteLength);
              res.setHeader("Cache-Control", "no-cache");
              res.end(Buffer.from(content));
              return;
            }

            logger.warn(
              `Pagefind: file not in bundle: "${filePath}" ` +
                `(available: ${[...files.keys()].join(", ") || "(none)"})`,
            );
          } catch (err) {
            logger.error("Pagefind serve error: " + (err as Error).message);
          }
          next();
        });

        // 3. Re-crawl on file changes in pages/ and content/.
        const scheduleRecrawl = debounce(() => {
          if (!srcDir) return;
          preCrawlDone = crawlAll(`http://localhost:${devPort}`, logger);
        }, 500);

        const pagesDir = fileURLToPath(new URL("pages/", srcDir!));
        const contentDir = fileURLToPath(new URL("content/", srcDir!));
        const onPageChange = (p: string) => {
          if (p.startsWith(pagesDir) || p.startsWith(contentDir)) {
            scheduleRecrawl();
          }
        };
        server.watcher.on("change", onPageChange);
        server.watcher.on("add", onPageChange);
      },

      "astro:server:start": async ({ address, logger }) => {
        devPort = address?.port ?? 4321;
        preCrawlDone = crawlAll(`http://localhost:${devPort}`, logger);
      },
    },
  };
}
