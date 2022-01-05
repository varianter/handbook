import React from "react";
import Layout from "src/layout";
import Book from "src/components/book";
import { MDXProvider } from "@mdx-js/react";
import { slugify } from "src/util";

type HandbookProps = React.PropsWithChildren<{
  meta: {
    title: string;
  };
  toc: Toc;
}>;

function LinkableH2({ children, ...props }: JSX.IntrinsicElements["h2"]) {
  console.log("inside here");
  const textContent = getNodeText(children);
  return (
    <h2 {...props} id={slugify(textContent)}>
      {children}
    </h2>
  );
}

function getNodeText(node: React.ReactNode): string {
  if (typeof node == "string") return node;
  if (typeof node == "number") return String(node);
  if (node == null) return "";
  if (Array.isArray(node)) return node.map(getNodeText).join("");
  console.log(node);
  return "";
  // return getNodeText(node);
}

const components = {
  h2: LinkableH2,
};

export function HandbookLayout(props: HandbookProps) {
  const subHeadings = props.toc[0].children.map((c) => c.value);
  console.log(props);
  return (
    <MDXProvider components={components}>
      <Layout subHeadings={subHeadings}>
        <Book filename="" {...props} />
      </Layout>
    </MDXProvider>
  );
}
