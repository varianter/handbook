import Link from 'next/link';
import { Url } from 'url';
import style from './illustrationList.module.css';

type IllustrationListProps = {
  figureName: FigureName;
  headerText: string;
  text: string;
  href?: Url;
  linkText?: string;
};

const figureName = [
  'airplaneTilt',
  'baby',
  'barbell',
  'book',
  'coins',
  'coinVertical',
  'deviceMobile',
  'documents',
  'firstAid',
  'firstAidKit',
  'graduationCap',
  'houseLine',
  'phoneCall',
  'presentationChart',
  'rocket',
  'scale',
  'tree',
  'wifiHigh',
] as const;

type FigureName = typeof figureName[number];

export const IllustrationList = ({
  figureName,
  text,
  href,
  linkText,
}: IllustrationListProps) => {
  return (
    <div className={style.illustrationList}>
      <div className={style.illustrationList__flex}>
        <img
          src={`./assets/illustrations/bulletpoints/${figureName}.svg`}
          alt={`Illustrasjon av ${figureName}`}
        />
        <p>
          {text} {href ? <Link href={href}>{linkText}</Link> : null}
        </p>
      </div>
    </div>
  );
};

export const IllustrationListHeader = ({
  figureName,
  headerText,
  text,
}: IllustrationListProps) => {
  return (
    <div className={style.illustrationList}>
      <div className={style.illustrationList__flex}>
        <img
          src={`./assets/illustrations/bulletpoints/${figureName}.svg`}
          alt={`Illustrasjon av ${figureName}`}
        />
        <h4>{headerText}</h4>
      </div>
      <p>{text}</p>
    </div>
  );
};

type IllustrasjonListLinkProps = {
  href: Url;
};

export const IllustrasjonListLink = ({
  figureName,
  text,
  href,
}: IllustrationListProps & IllustrasjonListLinkProps) => {
  return (
    <div className={style.illustrationList}>
      <div className={style.illustrationList__flex}>
        <img
          src={`./assets/illustrations/bulletpoints/${figureName}.svg`}
          alt={`Illustrasjon av ${figureName}`}
        />
        <Link href={href}>
          <a className={style.illustrationList__link}>{text}</a>
        </Link>
      </div>
    </div>
  );
};
