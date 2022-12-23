import Link from 'next/link';
import { useRouter } from 'next/router';
import { and } from 'src/utils/css';
import style from './processSelector.module.css';

type Process = {
  section: string;
  href: string;
};

type ProcessSelectorProps = {
  sections: Process[];
};

export const ProcessSelector = ({ sections }: ProcessSelectorProps) => {
  return (
    <div className={style.processSelector}>
      {sections.map((section) => {
        return (
          <ProcessSelectorButton
            section={section.section}
            hrefPath={section.href}
          />
        );
      })}
    </div>
  );
};

type ProcessSelectorButtonProps = {
  section: string;
  hrefPath: string;
};

const ProcessSelectorButton = ({
  section,
  hrefPath,
}: ProcessSelectorButtonProps) => {
  return (
    <div
      key={section}
      className={and(
        style.processSelectorButton,
        isCurrentPath(hrefPath) ? style.processSelectorButtonActive : '',
      )}
    >
      <Link href={hrefPath}>
        <a>{section}</a>
      </Link>
    </div>
  );
};

function isCurrentPath(buttonPath: string) {
  return buttonPath.slice(1) === useRouter().asPath;
}
