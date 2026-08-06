// ---------------------------------------------------------------------------
// query — the single source of truth (the URL's ?q=) and the bus that announces
// when it changes. No DOM, no components.
// ---------------------------------------------------------------------------

export function currentQuery(): string {
  return new URL(location.href).searchParams.get("q") ?? "";
}

const subscribers = new Set<(q: string) => void>();
let lastNotified = currentQuery();

/**
 * Change the query programmatically — used for live typing, where keystrokes
 * aren't navigations and so the bus below can't see them otherwise.
 *
 * replaceState fires the Navigation API's `navigate` event in supporting
 * browsers, where the listener below relays it to subscribers. In browsers
 * without the API this updates the URL silently — live search isn't wired
 * there; real <a>/<form> navigations instead trigger a full reload that
 * re-initialises from the URL.
 */
export function setQuery(q: string): void {
  if (q === currentQuery()) return;
  const url = new URL(location.href);
  if (q) url.searchParams.set("q", q);
  else url.searchParams.delete("q");
  history.replaceState(null, "", url);
}

export function onQueryChange(fn: (q: string) => void): void {
  subscribers.add(fn);
}

// The bus. `navigate` fires for link clicks, form submissions, and
// pushState/replaceState alike, so declarative <a href="?q="> / <form> markup
// AND programmatic setQuery all funnel through one place — this is the single
// interception point the Navigation API gives us for free. Cross-document
// navigations to the same path are intercepted so they don't reload; same-
// document changes (replaceState) just notify. Absent the API, nothing here
// runs and those navigations fall through to a real reload — the fallback.
if ("navigation" in window) {
  navigation.addEventListener("navigate", (event) => {
    const dest = new URL(event.destination.url);
    if (dest.pathname !== location.pathname) return; // a real navigation elsewhere — let it go

    const next = dest.searchParams.get("q") ?? "";
    const notify = () => {
      // Dedupe, and avoid depending on whether location has committed yet
      // (replaceState vs. cross-document timing differs).
      if (next === lastNotified) return;
      lastNotified = next;
      subscribers.forEach((fn) => {
        fn(next);
      });
    };

    // Cross-document navs (form GET, link click) must be intercepted to stay
    // in-page; same-document ones (replaceState) report canIntercept=false and
    // just need relaying. The branch handles both without assuming which it is.
    if (event.canIntercept) event.intercept({ handler: async () => notify() });
    else notify();
  });
}
