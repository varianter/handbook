import withPlugins from "next-compose-plugins";
import withImages from "next-images";

import { remarkMdxToc } from "remark-mdx-toc";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import { remarkMdxFrontmatter } from "remark-mdx-frontmatter";

import mdx from "@next/mdx";

const withMDX = mdx({
  extension: /\.mdx?$/,
  options: {
    providerImportSource: "@mdx-js/react",
    remarkPlugins: [
      remarkGfm,
      remarkFrontmatter,
      [remarkMdxFrontmatter, { name: "meta" }],
      remarkMdxToc,
    ],
    rehypePlugins: [],
  },
});

export default withPlugins([withImages, withMDX], {
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
