import { remarkMdxToc } from "remark-mdx-toc";
import remarkFrontmatter from "remark-frontmatter";
import { remarkMdxFrontmatter } from "remark-mdx-frontmatter";
import mdx from "@mdx-js/mdx";
const { createMdxAstCompiler } = mdx;

export const plugins = [
  remarkFrontmatter,
  [remarkMdxFrontmatter, { name: "meta" }],
  remarkMdxToc,
];

const astCompiler = createMdxAstCompiler({
  remarkPlugins: plugins,
});

export function vfileToAst(vfile) {
  return astCompiler.parse(vfile);
}
