import slugify from 'slugify';
import style from 'src/layouts/general/layout.module.css';
import { and } from 'src/utils/css';
import checkIfInclude from './checkIfHeadingShouldBeRemoved';
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
    <div
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
      {heading.children.map((c, index) => {
        if (checkIfInclude(c.value)) return null;
        return (
          <ul
            key={index}
            className={and(
              style.nav__inner__link__child,
              isOpen ? style.nav__inner__link__child__active : ' ',
            )}
          >
            <li className={style.nav__inner__link__children}>
              <a
                href={`#${slugify(c.value, {
                  lower: false,
                })}`}
                tabIndex={tabIndex}
              >
                {c.value}
              </a>
            </li>
          </ul>
        );
      })}
    </div>
  );
};

export default NavbarLinksMobile;
