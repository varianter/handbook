import style from './book.module.css';

type BookProps = React.PropsWithChildren<{
  filename: string;
}>;
const Book = ({ children, filename }: BookProps) => {
  const editUrl = `https://github.com/varianter/handbook/blob/master/content/${filename}`;
  return (
    <section>
      <article className="handbook">{children}</article>

      <footer className={style.footer}>
        <p>
          Ser du en feil eller noe som ikke kommer klart nok frem?{' '}
          <a href={editUrl}>Send beskjed eller foreslå en endring! 🥰</a>
        </p>
      </footer>
    </section>
  );
};

export default Book;

export function BookSummary({ children }: BookProps) {
  return <div className="handbook">{children}</div>;
}
