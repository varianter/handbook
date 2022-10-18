import React, { ReactNode, useState } from 'react';
import slugify from 'slugify';
import { Userdata, useUserdata } from 'src/auth';
import { TabButton, TabContainer, TabList, TabPanel } from '../tabbar';

export type Departments = 'Molde' | 'Trondheim' | 'Oslo' | 'Bergen';

type DepartmentProps = React.PropsWithChildren<{
  dep: Departments | Departments[];
  showAsAnonymous?: boolean;
}>;
export function Department({
  dep,
  showAsAnonymous = false,
  children,
}: DepartmentProps) {
  const user = useUserdata();
  const depArray = Array.isArray(dep) ? dep : [dep];
  const showInfo =
    (!user && showAsAnonymous) || depArray.includes(user?.department as any);

  if (!showInfo) {
    return null;
  }

  return children;
}

type DepartmentsOrAll = Departments[] | 'all';

type DepartmentItemProps = React.PropsWithChildren<{
  dep: Departments | DepartmentsOrAll;
  user?: Userdata;
  slug?: string;
  prefixId?: string;
  isVisible?: boolean;
}>;
export function DepartmentItem({
  isVisible,
  slug,
  prefixId,
  children,
}: DepartmentItemProps) {
  return (
    <TabPanel
      labelledBy={`${prefixId}-tab-${slug}`}
      isVisible={Boolean(isVisible)}
      id={`${prefixId}-panel-${slug}`}
    >
      {children}
    </TabPanel>
  );
}

type DepartmentGroupProps = React.PropsWithChildren<{
  dep: Departments | DepartmentsOrAll;
}>;
export function DepartmentGroup({ children }: DepartmentGroupProps) {
  const departments = toTruthyList(
    React.Children.toArray(children).map(getDepartmentPropsAsArray),
  );
  const user = useUserdata();
  const [selectedSlug, setSelectedSlug] = useState(() =>
    findInitialActiveSlug(departments, user),
  );

  const [prefixId] = useState(generateId);

  const newChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) {
      return null;
    }
    if (child.type != DepartmentItem) {
      return null;
    }
    const dep = getDepartmentPropsAsArray(child);
    const slug = toSlug(dep!);
    const isVisible = selectedSlug == slug;

    return React.cloneElement<DepartmentItemProps>(child as any, {
      user,
      isVisible,
      prefixId,
      slug,
    });
  });

  return (
    <TabContainer>
      <TabList label={'Velg avdeling'}>
        {departments.map((dep) => {
          const slug = toSlug(dep);
          return (
            <DepartureTabItem
              key={slug}
              deps={dep}
              slug={slug}
              prefixId={prefixId}
              isActive={slug == selectedSlug}
              onSelect={setSelectedSlug}
            />
          );
        })}
      </TabList>

      <div>{newChildren}</div>
    </TabContainer>
  );
}

type DepartureTabItemProps = {
  deps: DepartmentsOrAll;
  slug: string;
  prefixId: string;
  isActive: boolean;
  onSelect(slug: string, deps: DepartmentsOrAll): void;
};
function DepartureTabItem({
  deps,
  slug,
  prefixId,
  isActive,
  onSelect,
}: DepartureTabItemProps) {
  const names = deps == 'all' ? 'Alle' : deps.join(', ');

  return (
    <TabButton
      onClick={(e) => {
        e.preventDefault();
        onSelect(slug, deps);
      }}
      id={`${prefixId}-tab-${slug}`}
      title={`Velg ${names}`}
      controlsId={`${prefixId}-panel-${slug}`}
      selected={isActive}
    >
      {names}
    </TabButton>
  );
}

function findInitialActiveSlug(
  departments: DepartmentsOrAll[],
  user: Userdata | undefined,
) {
  const selectedFromUser = !user
    ? undefined
    : departments.find((dep) => {
        if (dep == 'all') return false;
        return dep.includes(user.department as any);
      });

  if (selectedFromUser) {
    return toSlug(selectedFromUser);
  }

  if (departments.includes('all')) {
    return toSlug('all');
  }

  return toSlug(departments[0]);
}

function getDepartmentProps(
  child: ReactNode,
): DepartmentItemProps['dep'] | undefined {
  if (typeof child != 'object' || child == null) return undefined;
  if (!('type' in child)) return undefined;
  if (child.type != DepartmentItem) return undefined;
  return (child.props as DepartmentItemProps).dep;
}
function getDepartmentPropsAsArray(
  child: ReactNode,
): DepartmentsOrAll | undefined {
  const dep = getDepartmentProps(child);
  if (!dep || dep == 'all' || Array.isArray(dep)) return dep;
  return [dep];
}
function toTruthyList<T>(arr: (T | undefined)[]): T[] {
  return arr.filter(Boolean) as T[];
}
function toSlug(deps: DepartmentsOrAll) {
  if (deps == 'all') return 'all';
  return slugify(deps.join('-'));
}

function generateId() {
  return Math.random().toString(16).slice(-4);
}
