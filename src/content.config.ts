import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { gitGlobLoader } from './loaders/git-glob';

const handbook = defineCollection({
  loader: gitGlobLoader({ pattern: '**/*.{md,mdx}', base: './src/content/handbook' }),
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
    /** Full SHA of the last commit to touch this page's source file, or null. */
    lastCommitSha: z.string().nullable().default(null),
    /** Committer date (ISO 8601) of the last commit, or null. */
    lastCommitDate: z.string().nullable().default(null),
    /** GitHub URL to the file blob at the last commit, or null. */
    lastCommitUrl: z.string().nullable().default(null),
  }),
});

export const collections = { handbook };