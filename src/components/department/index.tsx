import { useUserdata } from "src/auth";

export type Departments = "Molde" | "Trondheim" | "Oslo" | "Bergen";

type DepartmentProps = React.PropsWithChildren<{
  dep: Departments | Departments[];
  showAnon?: boolean;
}>;
export default function Department({
  dep,
  showAnon = false,
  children,
}: DepartmentProps) {
  const user = useUserdata();
  const depArray = Array.isArray(dep) ? dep : [dep];
  const showInfo =
    (!user && showAnon) || depArray.includes(user?.department as any);

  if (!showInfo) {
    return null;
  }

  return children;
}
