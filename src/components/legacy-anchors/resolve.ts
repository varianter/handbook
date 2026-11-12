// Resolves links written for the old Next.js handbook (before the Astro
// migration) to their new location.
//
// The old site was one long page per section, with heading ids made by
// `slugify(text, { lower: false })`, e.g. "/#Eierskap", "/#Lonn" or
// "/prosesser-raa#RA". The Astro site splits content into one page per topic
// and uses lowercase github-slugger ids ("/fundamentet/penger#eierskap",
// "/fundamentet/penger#lønn", "/prosesser/raa#rå"). Old links therefore land
// on the front page (or a 404) instead of the section they point to.

/** One linkable target in the handbook, emitted at build time. */
export interface AnchorTarget {
  /** Page path, e.g. "/fundamentet/penger". */
  page: string;
  /** Heading id on that page. Omitted for the page itself (its title). */
  id?: string;
  /** Loose key used to match old ids, see {@link anchorKey}. */
  key: string;
  /** Heading depth (the page title counts as 1). Shallower wins on ties. */
  depth: number;
}

/**
 * Case-, accent- and punctuation-insensitive key, so that old slugify ids
 * ("Lonn", "RA", "Kurs-og-konferanser") and new github-slugger ids or heading
 * texts ("lønn", "RÅ", "Kurs og konferanser") end up identical.
 */
export function anchorKey(text: string): string {
  return text
    .toLowerCase()
    .replaceAll("æ", "ae")
    .replaceAll("ø", "o")
    .replaceAll("å", "a")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]/g, "");
}

/** Old single-page sections and the new pages their content moved to. */
const LEGACY_SECTIONS: Record<string, string> = {
  "/": "/fundamentet/",
  "/handbook": "/fundamentet/",
  "/information": "/information/",
  "/prosesser": "/prosesser/",
  "/avdelinger": "/avdelinger/",
};

function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}

/**
 * Where an old path's content lives now. Ends with "/" when it maps to a
 * whole section, otherwise it is a single page.
 */
export function legacyScope(pathname: string): string {
  const path = normalizePath(pathname);
  const section = LEGACY_SECTIONS[path];
  if (section) {
    return section;
  }
  // Old process pages were flat: /prosesser-raa -> /prosesser/raa
  const processPage = path.match(/^\/prosesser-([\w-]+)$/)?.[1];
  return processPage ? `/prosesser/${processPage}` : path;
}

/** True for old page paths that no longer exist as-is (e.g. /prosesser-raa). */
export function isLegacyPath(pathname: string): boolean {
  return /^\/prosesser-[\w-]+$/.test(normalizePath(pathname));
}

/**
 * Returns the URL an old link should go to, or null when there is nothing
 * better to offer than the current page.
 *
 * @param hash The decoded fragment without "#", or "" for none.
 */
export function resolveLegacyUrl(
  targets: AnchorTarget[],
  pathname: string,
  hash: string,
): string | null {
  const scope = legacyScope(pathname);
  const inScope = (t: AnchorTarget) =>
    scope.endsWith("/") ? t.page.startsWith(scope) : t.page === scope;

  if (!hash) {
    // An old page path without a fragment: send it to the page it became.
    return isLegacyPath(pathname) && targets.some(inScope) ? scope : null;
  }

  const key = anchorKey(hash);
  if (!key) {
    return null;
  }

  // Prefer the page(s) the old link pointed into and fall back to the whole
  // handbook, in case a heading moved to another section in the migration.
  const matches = targets.filter((t) => t.key === key);
  const best = shallowest(matches.filter(inScope)) ?? shallowest(matches);
  if (!best) {
    return null;
  }

  // A page title can share its name with a heading on that page ("Rå" and
  // "RÅ" on /prosesser/raa). The heading is the more precise target.
  const pick = best.id
    ? best
    : (shallowest(matches.filter((t) => t.page === best.page && t.id)) ?? best);
  return pick.id ? `${pick.page}#${pick.id}` : pick.page;
}

/** Shallowest heading wins; on equal depth the first one (build order). */
function shallowest(targets: AnchorTarget[]): AnchorTarget | undefined {
  return targets.reduce<AnchorTarget | undefined>(
    (found, t) => (!found || t.depth < found.depth ? t : found),
    undefined,
  );
}
