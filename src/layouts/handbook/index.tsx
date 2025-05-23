import React from 'react';
import Layout, { getServerSideProps } from '../general';
import Book from 'src/components/book';
import { MDXProvider } from '@mdx-js/react';
import slugify from 'slugify';
import { LayoutProps } from '../signature';

import style from './handbook.module.css';

function createLinkable(el: 'h2' | 'h3' | 'h4') {
  return ({ children, ...props }: JSX.IntrinsicElements[typeof el]) => {
    const textContent = getNodeText(children);
    const slug = slugify(textContent, { lower: false });

    return React.createElement(
      el,
      {
        ...props,
        id: slug,
        key: slug,
      },
      <a className={style.titleLink} href={`#${slug}`}>
        {children}
      </a>,
    );
  };
}
/**
 * OBS!!
 * krever unike titler på headings. Hvis ikke vil man gå til en
 * h4 selv om man mente å gå til h3
 *
 */
const LinkableH2 = createLinkable('h2');
const LinkableH3 = createLinkable('h3');
const LinkableH4 = createLinkable('h4');

const components = {
  h2: LinkableH2,
  h3: LinkableH3,
  h4: LinkableH4,
};

export default function HandbookLayout({ children, ...props }: LayoutProps) {
  return (
    <MDXProvider components={components}>
      <Layout {...props}>
        <Book filename="">{children}</Book>
      </Layout>
    </MDXProvider>
  );
}

function getNodeText(node: React.ReactNode): string {
  if (typeof node == 'string') return node;
  if (typeof node == 'number') return String(node);
  if (typeof node == 'boolean') return '';
  if (typeof node == 'bigint') return '';
  if (node == null) return '';
  if (Array.isArray(node)) return node.map(getNodeText).join('');
  if ('props' in node) {
    return getNodeText(node.props.children);
  }
  return '';
}

export { getServerSideProps };
