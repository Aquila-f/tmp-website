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

export const collections = { photos };
