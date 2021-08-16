import { NextPage, InferGetStaticPropsType } from "next";
import { getStaticProps } from "pages/[handbook]";
import React from "react";
import Layout from "src/layout";
import Book from "src/components/book";

const HandbookIndex: NextPage<InferGetStaticPropsType<
  typeof getStaticProps
>> = React.memo(({ handbooks, content = "", subHeadings, filename }) => {
  return (
    <Layout handbooks={handbooks} subHeadings={subHeadings}>
      <Book content={content} filename={filename} />
    </Layout>
  );
});

export default HandbookIndex;
