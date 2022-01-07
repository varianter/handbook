import React from "react";
import Layout from "src/layout";
import Book from "src/components/book";
import { MDXProvider } from "@mdx-js/react";
import slugify from "slugify";

type HandbookProps = React.PropsWithChildren<{
  meta: Metadata;
  toc: Toc;
}>;

function LinkableH2({ children, ...props }: JSX.IntrinsicElements["h2"]) {
  const textContent = getNodeText(children);
  return (
    <h2 {...props} id={slugify(textContent, { lower: false })}>
      {children}
    </h2>
  );
}

const components = {
  h2: LinkableH2,
};

export function HandbookLayout(props: HandbookProps) {
  const subHeadings = props.toc[0].children.map((c) => c.value);

  return (
    <MDXProvider components={components}>
      <Layout subHeadings={subHeadings}>
        <Book filename="" {...props} />
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
