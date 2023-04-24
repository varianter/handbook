import slugify from 'slugify';
import style from 'src/layouts/general/layout.module.css';
import { and } from 'src/utils/css';
import checkIfInclude from './checkIfHeadingShouldBeRemoved';
const NavbarLinks = (props: {
  heading: TocItem;
  tabIndex: number;
  isOpen: boolean;
}) => {
  return (
    <div key={props.heading.value} className={style.nav__inner__link}>
      <a
        href={`#${slugify(props.heading.value, {
          lower: false,
        })}`}
        tabIndex={props.tabIndex}
      >
        {props.heading.value}
      </a>
      {props.heading.children.map((c, index) => {
        if (checkIfInclude(c)) return null;
        return (
          <ul
            key={index}
            className={and(
              style.nav__inner__link__child,
              props.isOpen ? style.nav__inner__link__child__active : ' ',
            )}
          >
            <li className={style.nav__inner__link__children}>
              <a
                href={`#${slugify(c.value, {
                  lower: false,
                })}`}
              >
                {c.value}
              </a>
              {/* {For å ha et ekstra lag med linker i navbaren (h4)} */}
              {/* {c.children.map((c, index) => {
                return (
                  <ul key={index}>
                    <li
                      className={style.nav__inner__link__children__of__children}
                    >
                      <a
                        href={`#${slugify(c.value, {
                          lower: false,
                        })}`}
                      >
                        {c.value}
                      </a>
                    </li>
                  </ul>
                );
              })} */}
            </li>
          </ul>
        );
      })}
    </div>
  );
};

export default NavbarLinks;
