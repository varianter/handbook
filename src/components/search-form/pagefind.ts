// ---------------------------------------------------------------------------
// Pagefind — one index per page, loaded once, shared. No DOM.
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

// The path is built as a variable, not a string literal, so Vite's static
// analysis leaves it alone: /pagefind/ only exists at runtime (built by
// `pagefind --site dist`, or served from memory in dev). CSP-safe (no eval).
const PAGEFIND_MODULE = '/pagefind/pagefind.js';

let loader: Promise<PagefindSearch | null> | undefined;

function load(): Promise<PagefindSearch | null> {
  return (loader ??= import(PAGEFIND_MODULE)
    .then((mod) => mod.search as PagefindSearch)
    .catch(() => {
      console.warn('pagefind: index not available');
      return null;
    }));
}

// Pre-warm the heavy WASM + index during idle time so the first query is
// instant. Best-effort: it still loads lazily on the first search() otherwise.
if (typeof requestIdleCallback === 'function') {
  requestIdleCallback(() => void load());
} else {
  setTimeout(() => void load(), 2000);
}

/**
 * Run a query. Tri-state, mapped to view states by the caller:
 *   null  → search unavailable
 *   []    → no matches
 *   [...] → hits
 */
export async function search(query: string): Promise<PagefindData[] | null> {
  const run = await load();
  if (!run) return null;
  const { results } = await run(query);
  return Promise.all(results.map((r) => r.data()));
}
