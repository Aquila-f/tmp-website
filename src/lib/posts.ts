import type { CollectionEntry } from 'astro:content';
import { withBase } from './url';

export type PostEntry = CollectionEntry<'posts'>;

export function getPostHref(post: PostEntry) {
  return withBase(post.data.permalink);
}

export function getPostRoute(post: PostEntry) {
  const match = post.data.permalink.match(/^\/posts\/(\d{4})\/(\d{2})\/([a-z0-9-]+)\/$/);

  if (!match) throw new Error(`Invalid post permalink: ${post.data.permalink}`);

  const [, year, month, slug] = match;
  return { year, month, slug };
}

export function sortPosts(entries: PostEntry[]) {
  return entries.toSorted((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
