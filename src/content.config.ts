import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const photos = defineCollection({
  loader: glob({
    base: './src/content/photos',
    pattern: '**/index.md',
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
  }),
  schema: z.object({
    alt: z.string().optional(),
    caption: z.string().optional(),
    location: z.string().optional(),
  }),
});

const reading = defineCollection({
  loader: glob({
    base: './src/content/reading',
    pattern: '**/index.md',
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    type: z.enum(['series', 'article']),
    series: z.string(),
    order: z.number().optional(),
    date: z.coerce.date().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { photos, reading };
