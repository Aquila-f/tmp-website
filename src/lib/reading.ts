import type { CollectionEntry } from 'astro:content';
import { withBase } from './url';

export type ReadingEntry = CollectionEntry<'reading'>;

export const isSeries = (entry: ReadingEntry) => entry.data.type === 'series';
export const isArticle = (entry: ReadingEntry) => entry.data.type === 'article';

export function getArticleSlug(entry: ReadingEntry) {
  const slug = entry.id.split('/').at(-1) ?? entry.id;
  return slug.replace(/^\d+(?:-\d+)?-/, '');
}

export function getSeriesHref(seriesId: string) {
  return withBase(`/blog/${seriesId}/`);
}

export function getArticleHref(entry: ReadingEntry) {
  return withBase(`/blog/${entry.data.series}/${getArticleSlug(entry)}/`);
}

export function formatReadingDate(date?: Date) {
  return date ? date.toISOString().slice(0, 10).replaceAll('-', '.') : '—';
}

export function sortArticles(entries: ReadingEntry[]) {
  return entries.toSorted((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));
}
