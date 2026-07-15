import type { CollectionEntry } from 'astro:content';
import { withBase } from './url';

export type BlogEntry = CollectionEntry<'blog'>;
export type EssayEntry = BlogEntry & {
  data: BlogEntry['data'] & { kind: 'essay'; date: Date; permalink: string };
};
export type BookNoteEntry = BlogEntry & {
  data: BlogEntry['data'] & { kind: 'book-note'; date: Date };
};
export type TechnicalSeriesEntry = BlogEntry & {
  data: BlogEntry['data'] & { kind: 'technical-series'; series: string };
};
export type TechnicalNoteEntry = BlogEntry & {
  data: BlogEntry['data'] & {
    kind: 'technical-note';
    series: string;
    order: number;
  };
};
export type BlogPostEntry = EssayEntry | BookNoteEntry | TechnicalNoteEntry;

export const isEssay = (entry: BlogEntry): entry is EssayEntry => entry.data.kind === 'essay';
export const isBookNote = (entry: BlogEntry): entry is BookNoteEntry => entry.data.kind === 'book-note';
export const isTechnicalSeries = (entry: BlogEntry): entry is TechnicalSeriesEntry => (
  entry.data.kind === 'technical-series'
);
export const isTechnicalNote = (entry: BlogEntry): entry is TechnicalNoteEntry => (
  entry.data.kind === 'technical-note'
);
export const isBlogPost = (entry: BlogEntry): entry is BlogPostEntry => (
  entry.data.kind === 'essay'
  || entry.data.kind === 'book-note'
  || entry.data.kind === 'technical-note'
);

export function getEntrySlug(entry: BlogEntry) {
  const slug = entry.id.split('/').at(-1) ?? entry.id;
  return slug.replace(/^\d+(?:-\d+)?-/, '');
}

export function getEssayHref(entry: EssayEntry) {
  return withBase(entry.data.permalink);
}

export function getEssayRoute(entry: EssayEntry) {
  const match = entry.data.permalink.match(/^\/posts\/(\d{4})\/(\d{2})\/([^/]+)\/$/);
  if (!match) throw new Error(`Invalid post permalink: ${entry.data.permalink}`);
  return { year: match[1], month: match[2], slug: match[3] };
}

export function getTechnicalSeriesHref(seriesId: string) {
  return withBase(`/blog/${seriesId}/`);
}

export function getTechnicalNoteHref(entry: TechnicalNoteEntry) {
  return withBase(`/blog/${entry.data.series}/${getEntrySlug(entry)}/`);
}

export function getBookNoteHref(entry: BookNoteEntry) {
  return withBase(`/blog/books/${getEntrySlug(entry)}/`);
}

export function getBlogPostHref(entry: BlogPostEntry) {
  if (entry.data.kind === 'essay') return withBase(entry.data.permalink);
  if (entry.data.kind === 'book-note') return withBase(`/blog/books/${getEntrySlug(entry)}/`);
  return withBase(`/blog/${entry.data.series}/${getEntrySlug(entry)}/`);
}

export function formatBlogDate(date?: Date) {
  return date ? date.toISOString().slice(0, 10).replaceAll('-', '.') : '—';
}

export function sortEssays(entries: EssayEntry[]) {
  return entries.toSorted((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function sortTechnicalNotes(entries: TechnicalNoteEntry[]) {
  return entries.toSorted((a, b) => a.data.order - b.data.order);
}

export function sortBookNotes(entries: BookNoteEntry[]) {
  return entries.toSorted((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function sortBlogPosts(entries: BlogPostEntry[]) {
  return entries.toSorted(
    (a, b) => (b.data.date?.getTime() ?? 0) - (a.data.date?.getTime() ?? 0),
  );
}
