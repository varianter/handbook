import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const handbook = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/handbook' }),
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
  }),
});

export const collections = { handbook };
