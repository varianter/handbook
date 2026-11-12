import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  type AnchorTarget,
  anchorKey,
  legacyScope,
  resolveLegacyUrl,
} from "./resolve.ts";

const t = (page: string, text: string, depth: number, id?: string) => ({
  page,
  id,
  key: anchorKey(text),
  depth,
});

// A trimmed-down version of what /legacy-anchors.json contains.
const targets: AnchorTarget[] = [
  t("/fundamentet/formaal-og-verdier", "Lønn", 4, "lønn"),
  t("/fundamentet/arbeidet", "RÅ", 3, "rå"),
  t("/fundamentet/arbeidet", "Kurs og konferanser", 3, "kurs-og-konferanser"),
  t("/fundamentet/arbeidet", "Variantdag", 3, "variantdag"),
  t("/fundamentet/sosialt", "SosKom", 2, "soskom"),
  t("/fundamentet/penger", "Penger", 1),
  t("/fundamentet/penger", "Lønn", 2, "lønn"),
  t("/fundamentet/penger", "Eierskap", 2, "eierskap"),
  t("/prosesser/raa", "Rå", 1),
  t("/prosesser/raa", "RÅ", 2, "rå"),
  t("/information/om-tid", "Ferie", 2, "ferie"),
  t("/avdelinger/trondheim", "SosKom", 3, "soskom"),
];

describe("anchorKey", () => {
  it("matches old slugify ids with new heading texts", () => {
    assert.equal(anchorKey("Lonn"), anchorKey("Lønn"));
    assert.equal(anchorKey("RA"), anchorKey("RÅ"));
    assert.equal(
      anchorKey("Kurs-og-konferanser"),
      anchorKey("kurs-og-konferanser"),
    );
    assert.equal(
      anchorKey("Formal-og-verdier"),
      anchorKey("Formål og verdier"),
    );
    assert.equal(anchorKey("Baerekraft"), anchorKey("bærekraft"));
  });
});

describe("legacyScope", () => {
  it("maps old pages to where their content lives now", () => {
    assert.equal(legacyScope("/"), "/fundamentet/");
    assert.equal(legacyScope("/information/"), "/information/");
    assert.equal(legacyScope("/prosesser-raa"), "/prosesser/raa");
    assert.equal(legacyScope("/fundamentet/penger/"), "/fundamentet/penger");
  });
});

describe("resolveLegacyUrl", () => {
  // Links in the pre-Astro format: one page per section, slugify ids
  const oldLinks: [string, string, string][] = [
    ["/", "Lonn", "/fundamentet/penger#lønn"],
    ["/", "Variantdag", "/fundamentet/arbeidet#variantdag"],
    ["/prosesser-raa", "RA", "/prosesser/raa#rå"],
    ["/", "Kurs-og-konferanser", "/fundamentet/arbeidet#kurs-og-konferanser"],
    ["/", "Eierskap", "/fundamentet/penger#eierskap"],
    ["/", "SosKom", "/fundamentet/sosialt#soskom"],
  ];
  for (const [path, hash, expected] of oldLinks) {
    it(`${path}#${hash} -> ${expected}`, () => {
      assert.equal(resolveLegacyUrl(targets, path, hash), expected);
    });
  }

  it("links old section headings to the page they became", () => {
    assert.equal(
      resolveLegacyUrl(targets, "/", "Penger"),
      "/fundamentet/penger",
    );
  });

  it("falls back to the whole handbook when the heading moved", () => {
    assert.equal(
      resolveLegacyUrl(targets, "/", "Ferie"),
      "/information/om-tid#ferie",
    );
  });

  it("redirects old process pages without a fragment", () => {
    assert.equal(
      resolveLegacyUrl(targets, "/prosesser-raa", ""),
      "/prosesser/raa",
    );
    assert.equal(resolveLegacyUrl(targets, "/", ""), null);
    assert.equal(resolveLegacyUrl(targets, "/prosesser-finnesikke", ""), null);
  });

  it("returns null for unknown fragments", () => {
    assert.equal(resolveLegacyUrl(targets, "/", "Finnes-ikke"), null);
    assert.equal(resolveLegacyUrl(targets, "/", "---"), null);
  });
});
