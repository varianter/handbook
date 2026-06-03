// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PagefindData {
  url: string;
  excerpt: string;
  meta?: { title?: string };
}

interface PagefindResponse {
  results: Array<{ data(): Promise<PagefindData> }>;
}

type PagefindSearch = (query: string) => Promise<PagefindResponse>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
function loadPagefind(): Promise<PagefindSearch | null> {
  return (pagefindPromise ??= (async (): Promise<PagefindSearch | null> => {
    try {
      // Pagefind lives at /pagefind/ at runtime; Function() hides the import
      // from the bundler's static analysis.
      const mod = await new Function('return import("/pagefind/pagefind.js")')();
      return mod.search;
    } catch {
      console.warn('SearchPopover: Pagefind not available');
      return null;
    }
  })());
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function message(text: string): HTMLParagraphElement {
  const p = document.createElement('p');
  p.textContent = text;
  return p;
}

function renderResult(data: PagefindData): HTMLElement {
  const link = document.createElement('a');
  link.href = data.url;
  link.textContent = data.meta?.title ?? data.url; // textContent: titles can't inject markup

  const heading = document.createElement('h3');
  heading.append(link);

  const excerpt = document.createElement('div');
  excerpt.innerHTML = data.excerpt; // Pagefind returns its own <mark>-highlighted HTML

  const article = document.createElement('article');
  article.append(heading, excerpt);
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
template.innerHTML = `
  <div class="panel" popover="auto">
    <form class="search-form" role="search">
      <input
        class="search-input"
        type="search"
        name="q"
        placeholder="Søk eller still spørsmål…"
        aria-label="Søk"
        autocomplete="off"
        enterkeyhint="search"
        autofocus
      />
      <div class="recent" data-pagefind-ignore>
        <h3>Andre har søkt etter</h3>
        <div class="chips">
          <button type="submit" value="Lønn">Lønn</button>
          <button type="submit" value="Aksjer">Aksjer</button>
          <button type="submit" value="Fordeler">Fordeler</button>
          <button type="submit" value="Miljøfyrtårn">Miljøfyrtårn</button>
        </div>
      </div>
    </form>
    <div class="results" aria-live="polite"></div>
  </div>`;

// ---------------------------------------------------------------------------
// Component — just wiring
// ---------------------------------------------------------------------------

/** The chosen query: a clicked chip's value wins, otherwise the typed text. */
function submittedQuery(event: SubmitEvent, input: HTMLInputElement): string {
  const submitter = event.submitter;
  if (submitter instanceof HTMLButtonElement && submitter.value) {
    return submitter.value;
  }
  return input.value.trim();
}

function syncUrl(query: string): void {
  const url = new URL(window.location.href);
  if (query) url.searchParams.set('q', query);
  else url.searchParams.delete('q');
  window.history.replaceState({}, '', url);
}

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

    // Start loading Pagefind as soon as the panel opens.
    panel.addEventListener('toggle', (event) => {
      if (event instanceof ToggleEvent && event.newState === 'open') void loadPagefind();
    });

    // One path for the search button, the Enter key, and every chip.
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const query = submittedQuery(event, input);
      input.value = query;
      recent.hidden = query !== '';
      syncUrl(query);
      void showSearchResults(results, query);
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
