import { defineCollection, z } from 'astro:content';
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
  }),
});

export const collections = { handbook };
