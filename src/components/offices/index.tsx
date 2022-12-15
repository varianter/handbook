import Link from 'next/link';
import style from './offices.module.css';

type OfficesProps = {
  handbook?: HeaderHandbook[];
  isActiveHandbook: Function;
  currentPath: string;
};

const Offices = ({ handbook, isActiveHandbook, currentPath }: OfficesProps) => {
  const offices = ['Oslo', 'Bergen', 'Trondheim'];
  return (
    <div className={style.offices}>
      {handbook
        ? handbook.map((office) => {
            return (
              <OfficeButton
                handbook={office}
                isActiveHandbookResult={isActiveHandbook(
                  office.path,
                  currentPath,
                )}
              />
            );
          })
        : offices.map((office, index) => {
            let lastSlashIndex = currentPath.lastIndexOf('/');
            let baseURL = currentPath.substring(1, lastSlashIndex + 1);
            return (
              <OfficeButton
                handbook={{
                  data: {
                    title: office,
                    order: index,
                  },
                  path: `${baseURL + office.toLocaleLowerCase()}`,
                  title: office,
                }}
                isActiveHandbookResult={isActiveHandbook(
                  `${office.toLowerCase()}`,
                  currentPath.substring(lastSlashIndex),
                )}
              />
            );
          })}
    </div>
  );
};

export default Offices;

type OfficeProps = {
  handbook: HeaderHandbook;
  isActiveHandbookResult: boolean;
};

const OfficeButton = ({ handbook, isActiveHandbookResult }: OfficeProps) => {
  return (
    <div>
      <Link href={`/${handbook.path}`}>
        <div
          className={
            isActiveHandbookResult ? style.office__active : style.office
          }
        >
          <a>{handbook.title}</a>
        </div>
      </Link>
    </div>
  );
};
