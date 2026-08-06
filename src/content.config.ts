import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { gitGlobLoader } from "./loaders/git-glob";

const handbook = defineCollection({
  loader: gitGlobLoader({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/handbook",
  }),
  schema: z.object({
    title: z.string(),
    /** Navigation display name — only needed when different from title */
    navTitle: z.string().optional(),
    /** Order within the section (lower = first). Defaults to 0. */
    order: z.number().default(0),
    /** Short description shown below link titles in sub-navigation menus */
    description: z.string().optional(),
    /** When true, render an "on this page" table of contents (h2–h4) */
    toc: z.boolean().default(false),
    /**
     * Metadata for the last commit to touch this page's source file, or null
     * when the file is untracked, uncommitted, git is unavailable, or the
     * remote isn't GitHub.
     */
    lastCommit: z
      .object({
        /** Full commit SHA. */
        commitSha: z.string(),
        /** Committer date (ISO 8601). */
        date: z.string(),
        /** File path relative to the repo root. */
        relPath: z.string(),
        /** GitHub owner/repo slug (e.g. "varianter/handbook"). */
        repoSlug: z.string(),
        /** SHA256 of relPath — used as the #diff- anchor in GitHub commit URLs. */
        pathHash: z.string(),
      })
      .nullable()
      .default(null),
  }),
});

export const collections = { handbook };
