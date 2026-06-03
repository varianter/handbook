// Navigation derived from the content collection at build time.
// The only manually maintained data: section overviews and external links.
// Everything else comes from frontmatter in src/content/handbook/.
import { getCollection } from 'astro:content';

export interface NavItem {
  title: string;
  path: string;
  order: number;
  description?: string;
  external?: boolean;
}

export interface ProcessNavItem extends NavItem {
  section: string;
}

/** Top-level sections — these are section landing pages in src/pages/, not the collection. */
export const HANDBOOK_SECTIONS: NavItem[] = [
  { title: 'Fundamentet', path: 'fundamentet', order: 0 },
  { title: 'Praktisk info', path: 'information', order: 1 },
  { title: 'Prosesser', path: 'prosesser', order: 2 },
  { title: 'Lokasjoner', path: 'avdelinger', order: 3 },
];

/** External links that aren't content pages. */
export const EXTERNAL_LINKS: NavItem[] = [];

/** Derive sub-pages for a given section from the content collection. */
export async function getSectionPages(section: string): Promise<NavItem[]> {
  const entries = await getCollection('handbook');
  return entries
    .filter((e) => e.id.startsWith(`${section}/`))
    .sort((a, b) => a.data.order - b.data.order)
    .map((e) => ({
      title: e.data.navTitle ?? e.data.title,
      path: e.id,
      order: e.data.order,
      description: e.data.description,
    }));
}

/** Derive process sub-pages with section labels for ProcessMenu. */
export async function getProcessSectionPages(): Promise<ProcessNavItem[]> {
  const entries = await getCollection('handbook');
  return entries
    .filter((e) => e.id.startsWith('prosesser/'))
    .sort((a, b) => a.data.order - b.data.order)
    .map((e) => ({
      section: e.data.section ?? e.data.title,
      title: e.data.navTitle ?? e.data.title,
      path: e.id,
      order: e.data.order,
    }))
    .concat(
      EXTERNAL_LINKS.map((l) => ({
        section: l.title,
        title: l.title,
        path: l.path,
        order: l.order,
        external: true,
      })),
    )
    .sort((a, b) => a.order - b.order);
}
