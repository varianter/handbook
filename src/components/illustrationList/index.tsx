import Link from 'next/link';
import { Url } from 'url';
import style from './illustrationList.module.css';

type IllustrationListProps = {
  figureName: FigureName;
  headingText: string;
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

type FigureName = (typeof figureName)[number];

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
          role="none"
          alt=""
        />
        <p>
          {text} {href ? <Link href={href}>{linkText}</Link> : null}
        </p>
      </div>
    </div>
  );
};

export const IllustrationListHeading = ({
  figureName,
  headingText,
  text,
}: IllustrationListProps) => {
  return (
    <div className={style.illustrationList}>
      <div className={style.illustrationList__flex}>
        <img
          src={`./assets/illustrations/bulletpoints/${figureName}.svg`}
          role="none"
          alt=""
        />
        <h4>{headingText}</h4>
      </div>
      <p>{text}</p>
    </div>
  );
};

export const IllustrationHeading = ({
  figureName,
  headingText,
}: IllustrationListProps) => {
  return (
    <div className={style.illustrationList}>
      <div className={style.illustrationList__flex}>
        <img
          src={`../assets/illustrations/bulletpoints/${figureName}.svg`}
          role="none"
          alt=""
        />
        <h3>{headingText}</h3>
      </div>
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
          role="none"
          alt=""
        />
        <Link href={href} className={style.illustrationList__link}>
          {text}
        </Link>
      </div>
    </div>
  );
};
