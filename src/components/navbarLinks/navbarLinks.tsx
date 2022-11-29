import slugify from 'slugify';
import style from 'src/layouts/general/layout.module.css';
import { and } from 'src/utils/css';
const NavbarLinks = (props: {
  heading: TocItem;
  tabIndex: number;
  isOpen: boolean;
}) => {
  return (
    <li key={props.heading.value} className={style.nav__inner__link}>
      <a
        href={`#${slugify(props.heading.value, { lower: false })}`}
        tabIndex={props.tabIndex}
      >
        {props.heading.value}
      </a>
      {props.heading.children.map((c) => {
        return (
          <ul
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
            </li>
          </ul>
        );
      })}
    </li>
  );
};

export default NavbarLinks;
