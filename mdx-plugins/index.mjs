import { remarkMdxToc } from "remark-mdx-toc";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import { remarkMdxFrontmatter } from "remark-mdx-frontmatter";

export const plugins = [
  remarkGfm,
  remarkFrontmatter,
  [remarkMdxFrontmatter, { name: "meta" }],
  remarkMdxToc,
];
