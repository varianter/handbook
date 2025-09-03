import Link from 'next/link';
import Image from 'next/image';
import style from './buttonBlobLink.module.css';

type ButtonBlobLinkProps = {
  imgName: string;
  buttonText: string;
  altText: string;
  href: string;
  height: number;
  width: number;
};

const ButtonBlobLink = ({
  imgName,
  buttonText,
  altText,
  href,
  height,
  width,
}: ButtonBlobLinkProps) => {
  return (
    <Link href={href} className={style.search__main}>
      <div className={style.buttonBlobLink__button}>
        <span>{buttonText}</span>
        <Image
          priority
          src={imgName}
          height={height}
          width={width}
          alt={altText}
        />
      </div>
    </Link>
  );
};

export default ButtonBlobLink;
