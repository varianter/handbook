# Search

This component uses [Pagefind](https://pagefind.app/) for full-text search — a static search library that indexes the built HTML at build time. No server, no third-party API, no client-side crawler.

## Why Pagefind

- **Fully static.** The search index is a set of static files served alongside the rest of the site. No backend required.
- **Self-contained.** No API keys, no usage limits, and no data sent off-site.
- **Low-bandwidth.** The index loads progressively; the browser only downloads the fragments needed for each query.
- **Good UX out of the box.** Built-in excerpt generation with `<mark>` highlighting, sub-result grouping by heading, and language-aware stemming (configured for Norwegian).
