// ---------------------------------------------------------------------------
// Pagefind — thin wrapper around the global loader injected by the
// pagefind-dev integration (see src/integrations/pagefind-dev.ts).
// No dynamic import here → no Vite transformation → no __VITE_PRELOAD__ issues.
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
