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
    section: z.enum(['technical', 'book']).default('technical'),
    series: z.string().optional(),
    order: z.number().optional(),
    date: z.coerce.date().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }).superRefine((entry, context) => {
    if (entry.type === 'series' && !entry.series) {
      context.addIssue({ code: 'custom', path: ['series'], message: 'Series entries require a series slug.' });
    }

    if (entry.type === 'article' && entry.section === 'technical' && !entry.series) {
      context.addIssue({ code: 'custom', path: ['series'], message: 'Technical articles require a parent series.' });
    }

    if (entry.type === 'article' && entry.section === 'technical' && entry.order === undefined) {
      context.addIssue({ code: 'custom', path: ['order'], message: 'Technical articles require an order.' });
    }
  }),
});

const posts = defineCollection({
  loader: glob({
    base: './src/content/posts',
    pattern: '**/*.md',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    permalink: z.string().regex(/^\/posts\/\d{4}\/\d{2}\/[a-z0-9-]+\/$/),
    tags: z.array(z.string()).default([]),
  }),
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

export const collections = { photos, reading, posts, portfolio, profile };
