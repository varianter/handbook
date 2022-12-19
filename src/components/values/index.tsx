import { BlobBackgroundText } from './blobBackgroundText';
import style from './values.module.css';
export const Values = () => {
  return (
    <div className={style.values}>
      <BlobBackgroundText
        headingText={'Åpenhet'}
        text={
          'Hva i all verden skal et selskap tjene på å holde informasjon hemmelig for sine ansatte?'
        }
        blobNr={1}
      />
      <BlobBackgroundText
        headingText={'Læreglede'}
        text={
          'Vi ønsker å lære og lære bort. Vi skal ha ydmykhet nok til å skjønne at vi kan lære noe fra alle, og troen på at alle kan lære noe fra oss.'
        }
        blobNr={2}
      />
      <BlobBackgroundText
        headingText={'Raushet'}
        text={
          'Dette vises i hvordan vi møter hverandre, våre kunder og folk i nærmiljøet.'
        }
        blobNr={3}
      />
    </div>
  );
};
