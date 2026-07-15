import type { CollectionEntry } from 'astro:content';
import { withBase } from './url';

export type PortfolioEntry = CollectionEntry<'portfolio'>;

export function getProjectSlug(project: PortfolioEntry) {
  return project.id;
}

export function getProjectHref(project: PortfolioEntry) {
  return withBase(`/portfolio/${getProjectSlug(project)}/`);
}

export function sortProjects(entries: PortfolioEntry[]) {
  return entries.toSorted((a, b) => a.data.order - b.data.order);
}
