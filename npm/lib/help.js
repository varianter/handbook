const marked = require("./md");

const pkg = require("../../package.json");

module.exports = function(pages) {
  return marked(`# Variant Håndbok (**v${pkg.version}**)

  Variants håndbok tilgjengelig i terminalen.

  Om du heller vil se håndboken i nettsideform, sjekk ut:
    https://handbook.variant.no/



## Bruk
  \`variant [side]\`

  Hvor side er en av ${pages
    .map(i => "`" + i + "`")
    .join(", ")}. Om ingen side blir sendt inn,
  vil håndboken vises.
  `);
};
