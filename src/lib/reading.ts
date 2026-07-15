import type { CollectionEntry } from 'astro:content';
import { withBase } from './url';

export type ReadingEntry = CollectionEntry<'reading'>;
export type SeriesEntry = ReadingEntry & {
  data: ReadingEntry['data'] & { type: 'series'; series: string };
};
export type SeriesArticle = ReadingEntry & {
  data: ReadingEntry['data'] & { type: 'article'; section: 'technical'; series: string; order: number };
};
export type BookNote = ReadingEntry & {
  data: ReadingEntry['data'] & { type: 'article'; section: 'book' };
};

export const isSeries = (entry: ReadingEntry): entry is SeriesEntry => entry.data.type === 'series';
export const isSeriesArticle = (entry: ReadingEntry): entry is SeriesArticle => (
  entry.data.type === 'article'
  && entry.data.section === 'technical'
  && Boolean(entry.data.series)
  && entry.data.order !== undefined
);
export const isBookNote = (entry: ReadingEntry): entry is BookNote => (
  entry.data.type === 'article' && entry.data.section === 'book'
);

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

export function getBookNoteHref(entry: BookNote) {
  return withBase(`/blog/books/${getArticleSlug(entry)}/`);
}

export function formatReadingDate(date?: Date) {
  return date ? date.toISOString().slice(0, 10).replaceAll('-', '.') : '—';
}

export function sortArticles(entries: SeriesArticle[]) {
  return entries.toSorted((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));
}

export function sortBookNotes(entries: BookNote[]) {
  return entries.toSorted((a, b) => (b.data.date?.getTime() ?? 0) - (a.data.date?.getTime() ?? 0));
}
