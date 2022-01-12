import { GetServerSideProps } from "next";
import { getSession, useSession } from "next-auth/react";

export { signIn, signOut } from "next-auth/react";

export type Userdata = {
  department: string;
  email: string;
  name: string;
};

export function useUserdata(): Userdata | undefined {
  const { data: session } = useSession();
  const user = session?.user as Userdata;
  return user;
}

export const getAuthServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      session: await getSession(context),
    },
  };
};
