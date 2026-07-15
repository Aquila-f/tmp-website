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

const blogFields = {
  title: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
};

const blog = defineCollection({
  loader: glob({
    base: './src/content/blog',
    pattern: '**/index.md',
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
  }),
  schema: z.discriminatedUnion('kind', [
    z.object({
      ...blogFields,
      kind: z.literal('essay'),
      date: z.coerce.date(),
      permalink: z.string().regex(/^\/posts\/\d{4}\/\d{2}\/[a-z0-9-]+\/$/),
    }),
    z.object({
      ...blogFields,
      kind: z.literal('book-note'),
      date: z.coerce.date(),
      author: z.string().optional(),
    }),
    z.object({
      ...blogFields,
      kind: z.literal('technical-series'),
      date: z.coerce.date().optional(),
      author: z.string().optional(),
      series: z.string().regex(/^[a-z0-9-]+$/),
    }),
    z.object({
      ...blogFields,
      kind: z.literal('technical-note'),
      date: z.coerce.date().optional(),
      series: z.string().regex(/^[a-z0-9-]+$/),
      order: z.number().int().positive(),
    }),
  ]),
});

const portfolio = defineCollection({
  loader: glob({
    base: './src/content/portfolio',
    pattern: '**/index.md',
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
  }),
  schema: ({ image }) => z.object({
    title: z.string(),
    excerpt: z.string(),
    date: z.coerce.date(),
    order: z.number().int().positive(),
    category: z.string().optional(),
    venue: z.string().optional(),
    paperurl: z.string().url().optional(),
    citation: z.string().optional(),
    image: image().optional(),
    imageAlt: z.string().optional(),
  }),
});

const profile = defineCollection({
  loader: glob({
    base: './src/content/profile',
    pattern: '*.md',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

export const collections = { photos, blog, portfolio, profile };
