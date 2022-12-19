import style from './blobBackgroundText.module.css';

type BlobBackgroundTextProps = {
  headingText: string;
  text: string;
  blobNr: number;
};

export const BlobBackgroundText = ({
  headingText,
  text,
  blobNr,
}: BlobBackgroundTextProps) => {
  return (
    <div className={style.blobBackgroundText}>
      <img
        src={`./assets/backgroundBlobs/blob${blobNr}.svg`}
        alt="background blob"
        className={style.blobBackgroundText__blob}
      />
      <h4>{headingText}</h4>
      <p>{text}</p>
    </div>
  );
};
