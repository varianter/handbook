import Link from 'next/link';
import { NextRouter, useRouter } from 'next/router';
import { and } from 'src/utils/css';
import style from './pageSelector.module.css';

type Page = {
  section: string;
  href: string;
};

type PageSelectorProps = {
  sections: Page[];
};

export const PageSelector = ({ sections }: PageSelectorProps) => {
  return (
    <div className={style.pageSelector}>
      {sections.map((section) => {
        return (
          <PageSelectorButton
            section={section.section}
            hrefPath={section.href}
          />
        );
      })}
    </div>
  );
};

type PageSelectorButtonProps = {
  section: string;
  hrefPath: string;
};

export const PageSelectorButton = ({
  section,
  hrefPath,
}: PageSelectorButtonProps) => {
  const route = useRouter();
  return (
    <div
      key={section}
      className={and(
        style.pageSelectorButton,
        isCurrentPath(hrefPath, route) ? style.pageSelectorButtonActive : '',
      )}
    >
      <Link href={hrefPath}>
        <a>{section}</a>
      </Link>
    </div>
  );
};

function isCurrentPath(buttonPath: string, route: NextRouter) {
  const currentPath = route.asPath.split('/');
  return buttonPath.slice(2) === currentPath[currentPath.length - 1];
}
