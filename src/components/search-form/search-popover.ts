// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SubResult {
  title: string;
  url: string;
  excerpt: string;
}

interface PagefindData {
  url: string;
  excerpt: string;
  meta?: { title?: string };
  sub_results?: SubResult[];
}

interface PagefindResponse {
  results: Array<{ data(): Promise<PagefindData> }>;
}

type PagefindSearch = (query: string) => Promise<PagefindResponse>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/** querySelector that narrows by instanceof instead of casting, and fails loudly. */
function find<T extends Element>(root: ParentNode, selector: string, ctor: new () => T): T {
  const el = root.querySelector(selector);
  if (!(el instanceof ctor)) {
    throw new Error(`SearchPopover: expected ${ctor.name} matching "${selector}"`);
  }
  return el;
}

// Pagefind is a page-level singleton: one index, loaded once, shared by every
// instance. Memoised here rather than on the component.
let pagefindPromise: Promise<PagefindSearch | null> | null = null;

// The Pagefind module lives at /pagefind/ at runtime (built by
// `pagefind --site dist` in production, or served from memory by
// pagefind-dev.ts in dev).  We construct the path as a variable rather than
// a string literal so Vite's static analysis won't try to resolve it — the
// file doesn't exist on disk or in node_modules at build/dev-transform time.
// This is CSP-safe (no eval) and is more robust than @vite-ignore across
// different Vite/Astro versions.
const PAGEFIND_MODULE = '/pagefind/pagefind.js';

function loadPagefind(): Promise<PagefindSearch | null> {
  return (pagefindPromise ??= (async (): Promise<PagefindSearch | null> => {
    try {
      const mod = await import(PAGEFIND_MODULE);
      return mod.search;
    } catch {
      console.warn('SearchPopover: Pagefind not available');
      return null;
    }
  })());
}

// Pre-warm Pagefind during browser idle time so the heavy WASM + index payload
// loads in the background.  When the user eventually opens search, the module
// is already cached / parsed and results appear without a loading spinner.
//
// This is best-effort: on browsers that don't support requestIdleCallback, or
// when the callback never fires, Pagefind still loads lazily when the popover
// opens or a search keystroke arrives.
function prewarmPagefind(): void {
  // Don't double-warm if something already triggered the load.
  if (pagefindPromise) return;
  pagefindPromise = (async () => {
    try {
      const mod = await import(PAGEFIND_MODULE);
      return mod.search;
    } catch {
      // Silently drop — loadPagefind will handle the fallback later.
      pagefindPromise = null;
      return null;
    }
  })();
}

if (typeof requestIdleCallback === 'function') {
  requestIdleCallback(() => prewarmPagefind());
} else {
  // Fallback for browsers without requestIdleCallback (e.g. Safari < 17).
  // The 2 s delay gives critical rendering time to finish.
  setTimeout(() => prewarmPagefind(), 2000);
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function message(text: string): HTMLParagraphElement {
  const p = document.createElement('p');
  p.textContent = text;
  return p;
}

const resultTemplate = document.createElement('template');
resultTemplate.innerHTML = `
  <article class="typeset py-s">
    <h4><a data-slot="link"></a></h4>
    <div data-slot="excerpt"></div>
    <ul data-slot="subs" hidden></ul>
  </article>`;

function renderResult(data: PagefindData): HTMLElement {
  const article = resultTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;

  const link = article.querySelector('[data-slot="link"]') as HTMLAnchorElement;
  link.href = data.url;
  link.textContent = data.meta?.title ?? data.url; // textContent: titles can't inject markup

  const excerpt = article.querySelector('[data-slot="excerpt"]')!;
  excerpt.innerHTML = data.excerpt; // Pagefind returns its own <mark>-highlighted HTML

  // Append section-level sub-results (Pagefind splits on heading IDs).
  // Skip the page-level entry (no # in URL) — the main link already covers it.
  const subs = (data.sub_results ?? []).filter((sr) => sr.url.includes('#'));
  if (subs.length) {
    const list = article.querySelector('[data-slot="subs"]') as HTMLUListElement;
    list.hidden = false;
    for (const sr of subs) {
      const li = document.createElement('li');
      const srLink = document.createElement('a');
      srLink.href = sr.url;
      srLink.textContent = sr.title;
      const srExcerpt = document.createElement('p');
      srExcerpt.innerHTML = sr.excerpt;
      li.append(srLink, srExcerpt);
      list.append(li);
    }
  }

  return article;
}

async function showSearchResults(container: HTMLElement, query: string): Promise<void> {
  if (!query) {
    container.replaceChildren();
    return;
  }

  container.replaceChildren(message('Søker…'));

  const search = await loadPagefind();
  if (!search) {
    container.replaceChildren(message('Søk er ikke tilgjengelig akkurat nå.'));
    return;
  }

  const { results } = await search(query);
  if (!results.length) {
    container.replaceChildren(message('🔎 Ingen direkte søkeresultater funnet.'));
    return;
  }

  const docs = await Promise.all(results.map((result) => result.data()));
  container.replaceChildren(...docs.map(renderResult));
}

// ---------------------------------------------------------------------------
// Markup (template)
// ---------------------------------------------------------------------------

const template = document.createElement('template');
template.innerHTML = /*html*/`
  <div
    style="max-width: 60ch;width: 100%;"
    class="panel  b-all b-faint bg-surface-default fg-default shadow-high popover"
    data-type="drawer"
    data-backdrop
    popover="auto"
  >
    <div class="px-m-l">

    <color-mode palette="blue" class="block pt-xl-2xl pb-s-m px-m-l mx--m-l bg-surface-sunken b-b b-default" >
    <div class="recent mb-m-l" data-pagefind-ignore>
      <h3>Andre har søkt etter</h3>
      <div class="stack-horizontal gap-xs">
        <a class="link" data-size="small" href="?q=Lønn">Lønn</a>
        <a class="link" data-size="small" href="?q=Aksjer">Aksjer</a>
        <a class="link" data-size="small" href="?q=Fordeler">Fordeler</a>
        <a class="link" data-size="small" href="?q=Miljøfyrtårn">Miljøfyrtårn</a>
      </div>
    </div>
    <form class="search-form stack " role="search">
      <label for="search" class="form-label mb-3xs">Søk i håndboken</label>
      <input
        class="search-input input flex-1"
        type="search"
        id="search"
        name="q"
        data-size="large"
        aria-label="Søk"
        autocomplete="off"
        enterkeyhint="search"
        autofocus
      />
    </form>
    </color-mode>

    <div class="results py-xl" aria-live="polite"></div>
    </div>
  </div>`;

// ---------------------------------------------------------------------------
// Component — just wiring
// ---------------------------------------------------------------------------

function syncUrl(query: string): void {
  const url = new URL(window.location.href);
  // Avoid a no-op replaceState that would fire a spurious navigate event, causing
  // the navigate → doSearch → syncUrl → navigate cycle to recurse infinitely.
  if ((url.searchParams.get('q') ?? '') === (query ?? '')) return;
  if (query) url.searchParams.set('q', query);
  else url.searchParams.delete('q');
  window.history.replaceState({}, '', url);
}

// Guard so the Navigation API listener is only wired once
// (connectedCallback may fire again if the element is moved by a framework).
let navigateWired = false;

let panelSeq = 0;

class SearchPopover extends HTMLElement {
  connectedCallback() {
    this.append(template.content.cloneNode(true));

    const panel = find(this, '.panel', HTMLElement);
    const form = find(this, '.search-form', HTMLFormElement);
    const input = find(this, '.search-input', HTMLInputElement);
    const recent = find(this, '.recent', HTMLElement);
    const results = find(this, '.results', HTMLElement);

    // Generate a unique panel id for popovertarget wiring.
    panel.id = `search-popover-panel-${panelSeq++}`;

    // Wire an external trigger (the component doesn't own the button).
    const targetSelector = this.getAttribute('target');
    if (targetSelector) {
      const trigger = document.querySelector(targetSelector);
      if (trigger instanceof HTMLElement) {
        trigger.setAttribute('popovertarget', panel.id);
      } else {
        console.warn(`SearchPopover: no element matching "${targetSelector}"`);
      }
    }

    // Start loading Pagefind as soon as the panel opens;
    // clear the URL query param when it closes.
    panel.addEventListener('toggle', (event) => {
      if (!(event instanceof ToggleEvent)) return;
      if (event.newState === 'open') {
        void loadPagefind();
      } else {
        syncUrl('');
      }
    });

    // Perform a search — shared by both submit and live-typing.
    const doSearch = (query: string): void => {
      recent.hidden = query !== '';
      syncUrl(query);
      void showSearchResults(results, query);
    };

    // Intercept same-page navigations that carry a search query — from any
    // source (plain <form method="get">, <a href="?q=…">, browser back, etc.) —
    // and open the popover instead of doing a full page load.
    if (!navigateWired) {
      navigateWired = true;
      navigation?.addEventListener('navigate', (event: NavigateEvent) => {
        const url = new URL(event.destination.url);
        const q = url.searchParams.get('q');
        if (!q || url.pathname !== location.pathname) return;
        event.preventDefault();
        input.value = q;
        panel.showPopover();
        doSearch(q);
      });
    }

    // Submit handler: the input is the source of truth.
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      input.value = input.value.trim();
      doSearch(input.value);
    });

    // Live search as the user types, debounced to avoid hammering Pagefind.
    input.addEventListener('input', debounce(() => {
      doSearch(input.value.trim());
    }, 250));

    // Chip links: intercept clicks to avoid a full page reload.
    recent.querySelector('.chips')!.addEventListener('click', (event) => {
      const link = (event.target as HTMLElement).closest('a[href]');
      if (!(link instanceof HTMLAnchorElement)) return;
      event.preventDefault();
      input.value = new URLSearchParams(link.search).get('q') ?? '';
      panel.showPopover();
      form.requestSubmit();
    });

    // Open and run if the URL already carries a query (or `open` is set).
    const initial = new URLSearchParams(window.location.search).get('q');
    if (this.hasAttribute('open') || initial) {
      panel.showPopover();
      if (initial) {
        input.value = initial;
        form.requestSubmit();
      }
    }
  }
}

customElements.define('search-popover', SearchPopover);
