import React from "react";
import Layout from "../general";
import Book from "src/components/book";
import { MDXProvider } from "@mdx-js/react";
import slugify from "slugify";
import { LayoutProps } from "../signature";
import { GetServerSideProps } from "next";

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

export const getServerSideProps: GetServerSideProps = async (context) => {
  console.log(context);
  return {
    props: {
      data: "hello",
    },
  };
};
