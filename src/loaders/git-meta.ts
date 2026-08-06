import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Git metadata for a single source file, surfaced to handbook pages as a
 * "last edited" link pointing at the commit that last touched the file.
 */

export interface GitMeta {
  /** Full commit SHA of the last commit to touch the file. */
  commitSha: string;
  /** Committer date in strict ISO 8601 (e.g. `2025-06-15T13:42:00+02:00`). */
  date: string;
  /** File path relative to the repo root. */
  relPath: string;
  /** GitHub owner/repo slug (e.g. `"varianter/handbook"`). */
  repoSlug: string;
  /** SHA256 of relPath — used as the #diff- anchor in GitHub commit URLs. */
  pathHash: string;
}

// Remote is stable for the lifetime of a build; resolved lazily and cached.
let originOwnerRepo: string | null | undefined;

/**
 * Resolves the GitHub `owner/repo` slug.
 *
 * In Vercel CI the clone has no `origin` remote, so we prefer Vercel's own
 * build-time env vars. Falls back to `git remote get-url origin` for local dev.
 */
function resolveOwnerRepo(): string | null {
  if (originOwnerRepo !== undefined) return originOwnerRepo;

  // Vercel provides these at build time — use them when available.
  const vercelOwner = process.env.VERCEL_GIT_REPO_OWNER;
  const vercelRepo = process.env.VERCEL_GIT_REPO_SLUG;
  if (vercelOwner && vercelRepo) {
    originOwnerRepo = `${vercelOwner}/${vercelRepo}`;
    return originOwnerRepo;
  }

  try {
    const url = execFileSync("git", ["remote", "get-url", "origin"], {
      encoding: "utf-8",
    }).trim();
    const match = url.match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?$/i);
    originOwnerRepo = match ? `${match[1]}/${match[2]}` : null;
  } catch {
    originOwnerRepo = null;
  }
  return originOwnerRepo;
}

let repoRoot: string | null | undefined;

function resolveRepoRoot(): string | null {
  if (repoRoot !== undefined) return repoRoot;
  try {
    repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
      encoding: "utf-8",
    }).trim();
  } catch {
    repoRoot = null;
  }
  return repoRoot;
}

/**
 * Returns git metadata for `absPath`, or `null` when the file is untracked,
 * uncommitted, git is unavailable, or the remote isn't GitHub.
 *
 * Never throws — a missing link is preferable to a failed build.
 */
export function getGitMeta(absPath: string): GitMeta | null {
  try {
    if (!existsSync(absPath)) return null;

    // execFileSync avoids a shell, so the `|` separator is safe here.
    const out = execFileSync(
      "git",
      ["log", "-1", "--format=%H|%cI", "--", absPath],
      { encoding: "utf-8" },
    ).trim();
    if (!out) return null; // untracked or no history (shallow clone)

    const separator = out.indexOf("|");
    if (separator < 0) return null;
    const sha = out.slice(0, separator);
    const date = out.slice(separator + 1);

    const ownerRepo = resolveOwnerRepo();
    if (!ownerRepo) return null; // non-GitHub remote → no usable URL

    const root = resolveRepoRoot();
    const relPath = root
      ? path.relative(root, absPath)
      : path.basename(absPath);

    // GitHub's commit-view anchors use SHA256 of the file path.
    const pathHash = createHash("sha256").update(relPath).digest("hex");

    return { commitSha: sha, date, relPath, repoSlug: ownerRepo, pathHash };
  } catch {
    return null;
  }
}

/**
 * Pure augmentation: returns `data` with a `lastCommit` object stamped on,
 * or `null` when git has nothing to say about `filePath`.
 * Exported so the behaviour can be unit-tested without Astro's loader machinery.
 */
export function augmentWithGitMeta<TData extends Record<string, unknown>>(
  filePath: string | undefined,
  data: TData,
): TData & { lastCommit: GitMeta | null } {
  const meta = filePath ? getGitMeta(filePath) : null;
  return {
    ...data,
    lastCommit: meta,
  };
}
