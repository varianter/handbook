import { remarkMdxToc } from 'remark-mdx-toc';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import { remark } from 'remark';
import remarkMdx from 'remark-mdx';

export const plugins = [
  remarkFrontmatter,
  [remarkMdxFrontmatter, { name: 'frontmatter' }],
  remarkMdxToc,
];

export function vfileToAst(vfile) {
  const data = remark()
    .use(remarkFrontmatter)
    .use([remarkMdxFrontmatter, { name: 'frontmatter' }])
    .use(remarkMdxToc)
    .use(remarkMdx)
    .parse(vfile);
  return data;
}
