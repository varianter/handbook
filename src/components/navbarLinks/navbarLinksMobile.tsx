import slugify from 'slugify';
import style from 'src/layouts/general/layout.module.css';
import { and } from 'src/utils/css';
const NavbarLinksMobile = (props: {
  heading: TocItem;
  tabIndex: number;
  isOpen: boolean;
}) => {
  return (
    <li
      key={props.heading.value}
      className={and(
        style.nav__hamburger_subheader,
        props.isOpen
          ? style.nav__hamburger_subheader__active
          : style.nav__hamburger_subheader,
      )}
    >
      <a
        href={`#${slugify(props.heading.value, { lower: false })}`}
        tabIndex={props.tabIndex}
      >
        {props.heading.value}
      </a>
    </li>
  );
};

export default NavbarLinksMobile;
