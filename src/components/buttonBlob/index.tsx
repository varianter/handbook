import Link from 'next/link';
import Image from 'next/image';
import style from './buttonBlob.module.css';

type ButtonBlobProps = {
  imgName: string;
  buttonText: string;
  altText: string;
  href: string;
  height: number;
  width: number;
};

const ButtonBlob = ({
  imgName,
  buttonText,
  altText,
  href,
  height,
  width,
}: ButtonBlobProps) => {
  return (
    <Link href={href} className={style.header__handbooks__search}>
      <div className={style.header__handbooks__search__button}>
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

export default ButtonBlob;
