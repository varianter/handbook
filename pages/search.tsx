import { GetServerSideProps } from "next";
import { Handbooks, getHandbookData } from "src/utils";
export { default } from "src/search/index";

export const getServerSideProps: GetServerSideProps<{
  handbooks: Handbooks;
}> = async () => {
  try {
    const handbooks = await getHandbookData();
    return {
      props: { handbooks },
    };
  } catch (e) {
    console.error(e);
    return {
      props: {
        handbooks: { handbooks: [], categories: [] },
      },
    };
  }
};
