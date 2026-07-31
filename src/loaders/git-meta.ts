import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

/**
 * Git metadata for a single source file, surfaced to handbook pages as a
 * "last edited" link pointing at the commit that last touched the file.
 */

export interface GitMeta {
  /** Full commit SHA of the last commit to touch the file. */
  sha: string;
  /** Committer date in strict ISO 8601 (e.g. `2025-06-15T13:42:00+02:00`). */
  date: string;
  /** GitHub URL to the file's blob at this commit. */
  url: string;
}

// Remote is stable for the lifetime of a build; resolved lazily and cached.
let originOwnerRepo: string | null | undefined;

/** Resolves `origin` to an `owner/repo` string, or null if it isn't GitHub. */
function resolveOwnerRepo(): string | null {
  if (originOwnerRepo !== undefined) return originOwnerRepo;
  try {
    const url = execFileSync('git', ['remote', 'get-url', 'origin'], {
      encoding: 'utf-8',
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
    repoRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], {
      encoding: 'utf-8',
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
      'git',
      ['log', '-1', '--format=%H|%cI', '--', absPath],
      { encoding: 'utf-8' },
    ).trim();
    if (!out) return null; // untracked or no history (shallow clone)

    const separator = out.indexOf('|');
    if (separator < 0) return null;
    const sha = out.slice(0, separator);
    const date = out.slice(separator + 1);

    const ownerRepo = resolveOwnerRepo();
    if (!ownerRepo) return null; // non-GitHub remote → no usable URL

    const root = resolveRepoRoot();
    const relPath = root ? path.relative(root, absPath) : path.basename(absPath);
    const url = `https://github.com/${ownerRepo}/blob/${sha}/${relPath}`;

    return { sha, date, url };
  } catch {
    return null;
  }
}

/**
 * Pure augmentation: returns `data` with the three git-meta fields stamped on,
 * or `null` placeholders when git has nothing to say about `filePath`.
 * Exported so the behaviour can be unit-tested without Astro's loader machinery.
 */
export function augmentWithGitMeta<TData extends Record<string, unknown>>(
  filePath: string | undefined,
  data: TData,
): TData & { lastCommitSha: string | null; lastCommitDate: string | null; lastCommitUrl: string | null } {
  const meta = filePath ? getGitMeta(filePath) : null;
  return {
    ...data,
    lastCommitSha: meta?.sha ?? null,
    lastCommitDate: meta?.date ?? null,
    lastCommitUrl: meta?.url ?? null,
  };
}