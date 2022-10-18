const fm = require('gray-matter');
const path = require('path');
const fg = require('fast-glob');

// Makes mdx in next.js suck less by injecting necessary exports so that
// the docs are still readable on github.
//
// Layout component for a .mdx or .md page can be specfied in the frontmatter.
// If no layout is wanted tag with `layout: none` in frontmatter. Default layout
// is "handbook". Add new layout to src/layouts with same signature.
//
// All metadata can be written in yaml front matter. It will be passed to the
// layout component as `frontmatter` prop.
//
// (Shamelessly stolen from React docs who has shamelessly stolen from Expo.io docs)
// @see https://github.com/reactjs/reactjs.org/blob/main/beta/plugins/md-layout-loader.js
// @see https://github.com/expo/expo/blob/master/docs/common/md-loader.js

module.exports = async function (src) {
  const callback = this.async();
  const { data } = fm(src);
  const layoutFolders = await fg(path.join(__dirname, '../src/layouts/*'), {
    onlyDirectories: true,
  });
  const availableLayouts = layoutFolders
    .map((r) => path.basename(r))
    .concat('none');

  const layout = availableLayouts.includes(data.layout)
    ? data.layout
    : 'handbook';

  if (layout === 'none') {
    return callback(null, src);
  }

  const code =
    src +
    `
import Layout, { getServerSideProps } from 'src/layouts/${layout}';

export default (props) => <Layout frontmatter={frontmatter} toc={toc} {...props} />;

export { getServerSideProps };
`;

  return callback(null, code);
};
