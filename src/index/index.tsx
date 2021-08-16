import Layout from "src/layout";
import { NextPage, InferGetStaticPropsType } from "next";
import { getStaticProps } from "pages";
import React from "react";
import Book from "src/components/book";

const IndexPage: NextPage<InferGetStaticPropsType<
  typeof getStaticProps
>> = React.memo(({ handbooks, content = "", subHeadings, filename }) => {
  return (
    <Layout handbooks={handbooks} subHeadings={subHeadings}>
      <Book content={content} filename={filename} />
    </Layout>
  );
});

export default IndexPage;
