import React from "react";
import Layout, { getServerSideProps } from "../general";
import Book from "src/components/book";
import { MDXProvider } from "@mdx-js/react";
import slugify from "slugify";
import { LayoutProps } from "../signature";

import style from "./handbook.module.css";

function createLinkable(el: "h2" | "h3") {
  return ({ children, ...props }: JSX.IntrinsicElements[typeof el]) => {
    const textContent = getNodeText(children);
    const slug = slugify(textContent, { lower: false });
    const childList = React.Children.toArray(children);
    return React.createElement(
      el,
      {
        ...props,
        id: slug,
      },
      childList.concat(
        <a className={style.anchor} href={`#${slug}`}>
          #
        </a>
      )
    );
  };
}
const LinkableH2 = createLinkable("h2");
const LinkableH3 = createLinkable("h3");

const components = {
  h2: LinkableH2,
  h3: LinkableH3,
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
  if (typeof node == "string") return node;
  if (typeof node == "number") return String(node);
  if (typeof node == "boolean") return "";
  if (node == null) return "";
  if (Array.isArray(node)) return node.map(getNodeText).join("");
  if ("props" in node) {
    return getNodeText(node.props.children);
  }
  return "";
}

export { getServerSideProps };
