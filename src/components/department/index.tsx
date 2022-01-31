import React, { ReactNode, useState } from "react";
import slugify from "slugify";
import { Userdata, useUserdata } from "src/auth";
import { and, ifCss } from "src/utils/css";

import style from "./department.module.css";

export type Departments = "Molde" | "Trondheim" | "Oslo" | "Bergen";

type DepartmentProps = React.PropsWithChildren<{
  dep: Departments | Departments[];
  showAnon?: boolean;
}>;
export function Department({
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

type DepartmentsOrAll = Departments[] | "all";

type DepartmentItemProps = React.PropsWithChildren<{
  dep: Departments | DepartmentsOrAll;
  user?: Userdata;
  isVisible?: boolean;
}>;
export function DepartmentItem({ isVisible, children }: DepartmentItemProps) {
  if (!isVisible) {
    return null;
  }

  return children;
}

type DepartmentGroupProps = React.PropsWithChildren<{
  dep: Departments | DepartmentsOrAll;
}>;
export function DepartmentGroup({ children }: DepartmentGroupProps) {
  const departments = toTruthyList(
    React.Children.toArray(children).map(getDepartmentPropsAsArray)
  );
  const user = useUserdata();
  const [selectedSlug, setSelectedSlug] = useState(() =>
    findInitialActiveSlug(departments, user)
  );

  const newChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type != DepartmentItem) {
        return null;
      }
      const dep = getDepartmentPropsAsArray(child);
      const isVisible = dep && selectedSlug == toSlug(dep);

      return React.cloneElement<DepartmentItemProps>(child, {
        user,
        isVisible,
      });
    }
    return null;
  });
  return (
    <div className={style.departmentGroup}>
      <ul className={style.tabMenu}>
        {departments.map((dep) => {
          const slug = toSlug(dep);
          return (
            <DepartureTabItem
              key={slug}
              deps={dep}
              slug={slug}
              isActive={slug == selectedSlug}
              onSelect={setSelectedSlug}
            />
          );
        })}
      </ul>

      <div>{newChildren}</div>
    </div>
  );
}

type DepartureTabItemProps = {
  deps: DepartmentsOrAll;
  slug: string;
  isActive: boolean;
  onSelect(slug: string, deps: DepartmentsOrAll): void;
};
function DepartureTabItem({
  deps,
  slug,
  isActive,
  onSelect,
}: DepartureTabItemProps) {
  const names = deps == "all" ? "Alle" : deps.join(", ");

  const className = and(style.tab, ifCss(isActive, style["tab--active"]));

  return (
    <button
      type="button"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        onSelect(slug, deps);
      }}
      title={`Velg ${names}`}
    >
      {names}
    </button>
  );
}

function findInitialActiveSlug(
  departments: DepartmentsOrAll[],
  user: Userdata | undefined
) {
  const selectedFromUser = !user
    ? undefined
    : departments.find((dep) => {
        if (dep == "all") return false;
        return dep.includes(user.department as any);
      });

  if (selectedFromUser) {
    return toSlug(selectedFromUser);
  }

  if (departments.includes("all")) {
    return toSlug("all");
  }

  return toSlug(departments[0]);
}

function getDepartmentProps(
  child: ReactNode
): DepartmentItemProps["dep"] | undefined {
  if (typeof child != "object" || child == null) return undefined;
  if (!("type" in child)) return undefined;
  if (child.type != DepartmentItem) return undefined;
  return (child.props as DepartmentItemProps).dep;
}
function getDepartmentPropsAsArray(
  child: ReactNode
): DepartmentsOrAll | undefined {
  const dep = getDepartmentProps(child);
  if (!dep || dep == "all" || Array.isArray(dep)) return dep;
  return [dep];
}
function toTruthyList<T>(arr: (T | undefined)[]): T[] {
  return arr.filter(Boolean) as T[];
}
function toSlug(deps: DepartmentsOrAll) {
  if (deps == "all") return "all";
  return slugify(deps.join("-"));
}
