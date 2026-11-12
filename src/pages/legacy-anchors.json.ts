// Build-time index of every page and heading in the handbook, used by
// LegacyAnchors.astro to send old links (e.g. "/#Eierskap") to the right page.
// Only fetched by the browser when a link's #fragment doesn't exist on the page.

import { type CollectionEntry, getCollection, render } from "astro:content";
import type { APIRoute } from "astro";
import {
  type AnchorTarget,
  anchorKey,
} from "../components/legacy-anchors/resolve";
import { HANDBOOK_SECTIONS } from "../config/navigation";

const sectionOrder = (entry: CollectionEntry<"handbook">) =>
  HANDBOOK_SECTIONS.findIndex((s) => entry.id.startsWith(`${s.path}/`));

export const GET: APIRoute = async () => {
  const entries = (await getCollection("handbook")).sort(
    (a, b) => sectionOrder(a) - sectionOrder(b) || a.data.order - b.data.order,
  );

  const targets: AnchorTarget[] = [];
  for (const entry of entries) {
    const page = `/${entry.id}`;
    // Old section pages had h2s for what are now whole pages ("/#Penger").
    targets.push({
      page,
      key: anchorKey(entry.data.navTitle ?? entry.data.title),
      depth: 1,
    });

    const { headings } = await render(entry);
    for (const heading of headings) {
      targets.push({
        page,
        id: heading.slug,
        key: anchorKey(heading.text),
        depth: heading.depth,
      });
    }
  }

  return new Response(JSON.stringify(targets), {
    headers: { "Content-Type": "application/json" },
  });
};
