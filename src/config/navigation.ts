import { getCollection, type CollectionEntry } from 'astro:content';

type HandbookEntry = CollectionEntry<'handbook'>;

export interface NavItem {
  title: string;
  path: string;
  order: number;
  description?: string;
  external?: boolean;
}

/** Top-level sections — these are section landing pages in src/pages/, not the collection. */
export const HANDBOOK_SECTIONS: NavItem[] = [
  { title: 'Fundamentet', path: 'fundamentet', order: 0 },
  { title: 'Praktisk info', path: 'information', order: 1 },
  { title: 'Prosesser', path: 'prosesser', order: 2 },
  { title: 'Lokasjoner', path: 'avdelinger', order: 3 },
];

/** Derive sub-pages for a given section from the content collection. */
export async function getSectionPages(section: string): Promise<NavItem[]> {
  const entries: HandbookEntry[] = await getCollection('handbook');
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

