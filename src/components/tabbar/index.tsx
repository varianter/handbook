import { PropsWithChildren } from 'react';
import Button, { ButtonProps } from '../button';
import style from './tabbar.module.css';

type TabProps = { selected?: boolean; controlsId: string } & ButtonProps;
export function TabButton({
  selected = false,
  controlsId,
  ...props
}: TabProps) {
  return (
    <Button
      role="tab"
      aria-controls={controlsId}
      aria-selected={selected}
      {...props}
    />
  );
}

type TabListProps = PropsWithChildren<{ label: string }>;
export function TabList({ label, children }: TabListProps) {
  return (
    <div role="tablist" aria-label={label} className={style.tablist}>
      <nav className={style.tablist__nav}>{children}</nav>
    </div>
  );
}

type TabPanelProps = PropsWithChildren<{
  labelledBy: string;
  isVisible: boolean;
  id: string;
}>;
export function TabPanel({
  labelledBy,
  id,
  isVisible,
  children,
}: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      tabIndex={0}
      hidden={!isVisible}
      aria-labelledby={labelledBy}
      className={style.tabpanel}
      id={id}
    >
      {children}
    </div>
  );
}

type TabContainerProps = PropsWithChildren<{}>;
export function TabContainer({ children }: TabContainerProps) {
  return <div className={style.container}>{children}</div>;
}
