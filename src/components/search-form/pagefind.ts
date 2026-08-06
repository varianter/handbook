// ---------------------------------------------------------------------------
// Pagefind — thin wrapper. The actual pagefind.js bundle is loaded via a
// global injected by the pagefind integration as a head-inline script.
//
// This avoids Vite's import analysis trying to resolve /pagefind/pagefind.js,
// which is served at runtime by the integration's middleware.
// ---------------------------------------------------------------------------

export interface SubResult {
  title: string;
  url: string;
  excerpt: string;
}

export interface PagefindData {
  url: string;
  excerpt: string;
  meta?: { title?: string };
  sub_results?: SubResult[];
}

interface PagefindResponse {
  results: Array<{ data(): Promise<PagefindData> }>;
}

type PagefindSearch = (query: string) => Promise<PagefindResponse>;

declare global {
  var __pagefindLoad: () => Promise<PagefindSearch | null>;
}

/**
 * Run a query. Tri-state, mapped to view states by the caller:
 *   null  → search unavailable
 *   []    → no matches
 *   [...] → hits
 */
export async function search(query: string): Promise<PagefindData[] | null> {
  const run = await __pagefindLoad();
  if (!run) return null;
  const { results } = await run(query);
  return Promise.all(results.map((r) => r.data()));
}
