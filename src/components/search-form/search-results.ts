import { currentQuery, onQueryChange } from "./query";
import { search, type PagefindData, type SubResult } from "./pagefind";
import { find } from "./dom";

// ---------------------------------------------------------------------------
// <search-results> — reacts to the shared query and paints into author-supplied
// <template> elements, so all markup and styling live in the document. The only
// JS-side concerns are data binding and search timing (latest-wins).
//
// Slots:    <div data-slot="output">      where results render
//           [data-slot="link|excerpt|subs"] fill points inside a result template
// Templates: data-template="result"        (required)
//            data-template="empty"          (required)
//            data-template="subresult"      (optional — absent ⇒ subresults skipped)
//            data-template="loading"        (optional — absent ⇒ nothing shown while searching)
//            data-template="unavailable"    (optional — absent ⇒ nothing shown on failure)
// ---------------------------------------------------------------------------

const slot = <T extends Element>(
  root: ParentNode,
  name: string,
  ctor: new () => T,
): T => find(root, `[data-slot="${name}"]`, ctor);

class SearchResults extends HTMLElement {
  connectedCallback(): void {
    const output = slot(this, "output", HTMLElement);

    const template = (name: string) =>
      this.querySelector<HTMLTemplateElement>(
        `template[data-template="${name}"]`,
      );
    const required = (name: string): HTMLTemplateElement => {
      const t = template(name);
      if (!t)
        throw new Error(
          `<search-results>: missing <template data-template="${name}">`,
        );
      return t;
    };

    const tResult = required("result");
    const tEmpty = required("empty");
    const tSub = template("subresult");
    const tLoading = template("loading");
    const tUnavailable = template("unavailable");

    const fill = (t: HTMLTemplateElement): HTMLElement =>
      t.content.firstElementChild!.cloneNode(true) as HTMLElement;

    // For optional states: clone the template if present, otherwise clear.
    const showOptional = (t: HTMLTemplateElement | null): void =>
      output.replaceChildren(...(t ? [fill(t)] : []));

    const renderSub = (sr: SubResult): HTMLElement => {
      const el = fill(tSub!); // only called when tSub exists
      const link = slot(el, "link", HTMLAnchorElement);
      link.href = sr.url;
      link.textContent = sr.title; // textContent: titles can't inject markup
      slot(el, "excerpt", HTMLElement).innerHTML = sr.excerpt; // Pagefind's own <mark> HTML
      return el;
    };

    const renderResult = (data: PagefindData): HTMLElement => {
      const el = fill(tResult);
      const link = slot(el, "link", HTMLAnchorElement);
      link.href = data.url;
      link.textContent = data.meta?.title ?? data.url;
      slot(el, "excerpt", HTMLElement).innerHTML = data.excerpt;

      // Section-level hits (Pagefind splits on heading IDs); skip the page-level
      // entry (no #) — the title link already covers it.
      const host = el.querySelector('[data-slot="subs"]');
      const subs = (data.sub_results ?? []).filter((s) => s.url.includes("#"));
      if (host instanceof HTMLElement) {
        if (!tSub || !subs.length) host.remove();
        else {
          host.hidden = false;
          host.append(...subs.map(renderSub));
        }
      }
      return el;
    };

    // Pure view update for a query. A monotonic token makes the latest call
    // win, so a slow earlier search can't repaint over a faster later one.
    let seq = 0;
    const paint = async (q: string): Promise<void> => {
      if (!q) {
        output.replaceChildren();
        return;
      }

      const token = ++seq;
      showOptional(tLoading);

      const data = await search(q);
      if (token !== seq) return;
      if (data === null) return showOptional(tUnavailable);
      if (!data.length) return void output.replaceChildren(fill(tEmpty));
      output.replaceChildren(...data.map(renderResult));
    };

    onQueryChange(paint);
    paint(currentQuery()); // deep-link / reload / fallback
  }
}

customElements.define("search-results", SearchResults);
