import { getHandbookProps, HandbookProps } from "src/utils";
import { GetStaticProps } from "next";
export { default } from "src/index/index";

export const getStaticProps: GetStaticProps<HandbookProps> = async () => {
  try {
    const props = await getHandbookProps();
    return {
      props: { ...props },
      revalidate: 60 * 60,
    };
  } catch (e) {
    console.error(e);
    return {
      props: { handbooks: [], subHeadings: [], filename: "" },
    };
  }
};
