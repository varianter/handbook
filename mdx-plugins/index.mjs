import { remarkMdxToc } from 'remark-mdx-toc';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import { compile } from '@mdx-js/mdx';

export const plugins = [
  remarkFrontmatter,
  [remarkMdxFrontmatter, { name: 'frontmatter' }],
  remarkMdxToc,
];

export function vfileToAst(vfile) {
  return compile(vfile, {
    remarkPlugins: plugins,
  });
}
