const withPlugins = require("next-compose-plugins");
const withImages = require("next-images");

const withMDX = require("@next/mdx")({
  extension: /\.mdx?$/,
});

module.exports = withPlugins([withImages, withMDX], {
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  images: {
    disableStaticImages: true,
  },
  redirects: async () => {
    return [
      {
        source: "/:slug*.html", // Old url with .html
        destination: "/:slug*", // Redirect without .html
        permanent: true,
      },
    ];
  },
  webpack: (config) => {
    const oneOf = config.module.rules.find(
      (rule) => typeof rule.oneOf === "object"
    );
    if (oneOf) {
      const moduleCssRule = oneOf.oneOf.find((rule) =>
        regexEqual(rule.test, /\.module\.css$/)
      );
      if (moduleCssRule) {
        const cssLoader = moduleCssRule.use.find(({ loader }) =>
          loader.includes("css-loader")
        );
        if (cssLoader) {
          cssLoader.options.modules.mode = "local";
        }
      }
    }
    return config;
  },
});

function regexEqual(x, y) {
  return (
    x instanceof RegExp &&
    y instanceof RegExp &&
    x.source === y.source &&
    x.global === y.global &&
    x.ignoreCase === y.ignoreCase &&
    x.multiline === y.multiline
  );
}
