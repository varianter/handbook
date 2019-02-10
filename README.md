# Jobbhåndbok for Variant

Jobbhåndbok for Variant som er i kontinuerlig utvikling og forbedring.
Tilgjengelig som Markdown via NPM, i Terminalen, eller kanskje først og fremst
på nettsiden: https://handbook.variant.no.

Har du spørsmål, kommentarer eller forbedringer til teksten? Send inn en Pull
Request, da!

## Installering via NPM

Tilgjengelig som data og i terminalen!

### I terminalen

Du kan lese om Variant fra terminalen:

```shell
npm i -g @variant/handbook
# Installerer...

# Kjør:
variant -h
# Viser hjelpetekst.

# Kjør:
variant
# Gir oversikt over seksjoner du kan lese
```

### Som markdown data

```shell
npm install @variant/handbook
```

Foreløpig ganske spartansk dokumentasjon, men det kommer seg.

```js
const variant = require("@variant/handbook");

variant.getPage("handbook").then(function(data) {
  console.log(data.output);
  // data is of format:
  // {
  //   modified: Date, // When page last changed
  //   toc: Array<ToC>, // Overview of table of contents
  //   raw: string, // Raw markdown
  //   output: string  // Parsed markdown in ansi colors
  // }
  // ToC Object format:
  // {
  //   content: string, // Title. Use this in getSection
  //   level: number, // level of heading (1-6)
  // }
});

variant.pages().then(async function(pages) {
  // pages is of type Array<string>
  const page = await variant.getPage(pages[1]);

  // Gets rendered ansi markdown of the second section of second page
  const markdownOfSection = variant.getSection(page.toc[1]);
});
```

## Oppsett av prosjekt lokalt

Dersom man skal deploye oppdateringer av håndboken selv forutsettes det at man
har [Node.js](https://nodejs.org/en/) istallert. Når man installerer Node.js får
man også med NPM som pakkehåndterer. Fra root av dette repoet, må man installere
alle avhengigheter:

```shell
npm install
```

## Lag ny versjon av nettsiden

Nå ligger sammensydde filene ute under `docs/`. Dette er en mappe som blir
konstruert når man bygger på nytt. Kildekodene ligger under `src/`, og statiske
filer som skal med (f.eks bilder, styles, JavaScript osv) legges under
`src/static/`.

Når man har endret innhold, layout eller statiske filer kan man bygge en ny
versjon via terminalen:

```shell
npm run build
```

Dette vil generere og kopiere over alle filer til `docs/` og gjøre at du har
unstaged changes i git. Stage, commit og push disse og det vil automatisk
publiseres på nettsiden.

Når vi gjør flere endringer er det enklere å lytte på filendringer for å bygge:

```shell
npm run watch
```

## Kjør siden lokalt

For å teste URL-er er det alltid bedre å kjøre en HTTP-tjener. Dette kreves og
for å teste service workers. For å kjøre en lokal test server kjør følgende
kommando i terminalen:

```shell
npm start
```

## Automatisk deploy av nettside og NPM modul

Det er satt opp kontinuerlig bygging av siden og NPM-modulen. Håndboken blir
hostet via gh-pages i
[varianter/handbook-host](https://github.com/varianter/handbook-host) og blir
bygget [av Travis CI](https://travis-ci.org/varianter/handbook).

Nettsiden blir deployet for hver gang master blir endret, men NPM-modul blir kun
deployet hver gang en ny Git tag blir lagt til.

## Legge til ny git tag

Tenk på versjonering av NPM-modul. Er det brekkende endring? `major`. Er det Ny
feature? `minor`. Er det bare tekstendringer? `patch`. For å bumpe versjon og
lage ny tag kan man bruke `mversion` som dette:

```shell
npx mversion patch -m
```

Hvor `patch` kan være `major`, `minor` eller `patch`.

Dette vil sette ny versjon i `package.json` og lage en annotert git tag. For å
pushe det ut på Github brukes følgende kommando:

```shell
git push && git push --tags
```

Dette vil pushe både vanlig commits og den nye tag-en. Dersom det er
API-endringer, husk å dokumenter det i
[releases](https://github.com/varianter/handbook/releases) som changelog.
