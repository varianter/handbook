import MarkdownIt from "markdown-it";
import { useMemo } from "react";
import markdownItTocAndAnchor from "markdown-it-toc-and-anchor";
import style from "./book.module.css";

interface BookProps {
  content: string;
  filename: string;
}
const Book = ({ content, filename }: BookProps) => {
  const innerHtml = useMemo(() => {
    const md = new MarkdownIt({
      linkify: true,
      html: true,
      typographer: true,
    }).use(markdownItTocAndAnchor, {
      tocFirstLevel: 2,
      tocLastLevel: 6,
      anchorLink: true,
    });

    return { __html: md.render(content) };
  }, [content]);

  const editUrl = `https://github.com/varianter/handbook-v2/blob/master/content/${filename}`;

  return (
    <section>
      <article
        className="handbook"
        dangerouslySetInnerHTML={innerHtml}
      ></article>

      <footer className={style.footer}>
        <p>
          Ser du en feil eller noe som ikke kommer klart nok frem?{" "}
          <a href={editUrl}>Send beskjed eller foreslå en endring! 🥰</a>
        </p>
      </footer>
    </section>
  );
};

export default Book;

export function BookSummary({ content }: BookProps) {
  const innerHtml = useMemo(() => {
    const md = new MarkdownIt({
      linkify: true,
      html: true,
      typographer: true,
    })
      .disable(["image"])
      .use(markdownItTocAndAnchor, {
        tocFirstLevel: 2,
        tocLastLevel: 6,
        anchorLink: true,
      });

    return { __html: md.render(content) };
  }, [content]);

  return <div className="handbook" dangerouslySetInnerHTML={innerHtml}></div>;
}
