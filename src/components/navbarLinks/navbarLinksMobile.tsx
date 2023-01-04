import slugify from 'slugify';
import style from 'src/layouts/general/layout.module.css';
import { and } from 'src/utils/css';
type NavbarLinksMobileProps = {
  heading: TocItem;
  tabIndex: number;
  isOpen: boolean;
};

const NavbarLinksMobile = ({
  heading,
  tabIndex,
  isOpen,
}: NavbarLinksMobileProps) => {
  return (
    <li
      key={heading.value}
      className={and(
        style.nav__hamburger_subheader,
        isOpen
          ? style.nav__hamburger_subheader__active
          : style.nav__hamburger_subheader,
      )}
    >
      <a
        href={`#${slugify(heading.value, { lower: false })}`}
        tabIndex={tabIndex}
      >
        {heading.value}
      </a>
    </li>
  );
};

export default NavbarLinksMobile;
