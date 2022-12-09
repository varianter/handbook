import favicon from '@variant/profile/lib/logo/favicon.png';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import { getAuthServerSideProps } from 'src/auth';
import BackgroundBlobs from 'src/background';
import LoginForm from 'src/components/login-form';
import { and } from 'src/utils/css';
import { LayoutProps } from '../signature';
import style from './layout.module.css';
import navBackground from './navBackground.svg';
import NavbarLinks from 'src/components/navbarLinks/navbarLinks';

import backArrow from './backArrow.svg';
import magnifyingGlass from './magnifyingGlass.svg';
import searchBlob from './searchBlob.svg';

const title = 'Variant Håndbok';

const isActiveHandbook = (path: string, asPath: string, isCategory = false) => {
  if (asPath === '/' && path === 'handbook') return true;
  if (isCategory) return asPath.includes(path.split('/')[0]);
  return `/${path}` === asPath;
};

const isLandingpage = (asPath: string) => {
  return asPath === '/';
};

// @TODO This should be automatically generated from the tree structure
const metadata = {
  handbooks: [
    {
      data: {
        title: 'En variants håndbok',
      },
      path: '',
      title: 'En variants håndbok',
    },
    {
      data: {
        title: 'Praktisk info',
      },
      path: 'information',
      title: 'Praktisk info',
    },
    {
      data: {
        title: 'Prosesser',
      },
      path: 'prosesser',
      title: 'Prosesser',
    },
    {
      data: {
        title: 'Lokasjoner',
      },
      path: 'avdelinger',
      title: 'Lokasjoner',
    },
  ],
  categories: [
    {
      path: 'avdelinger/trondheim',
      title: 'Lokasjoner',
      handbooks: [
        {
          data: {
            title: 'Trondheim',
            order: 0,
          },
          path: 'avdelinger/trondheim',
          title: 'Trondheim',
        },
        {
          data: {
            title: 'Oslo',
            order: 1,
          },
          path: 'avdelinger/oslo',
          title: 'Oslo',
        },
        {
          data: {
            title: 'Bergen',
            order: 1,
          },
          path: 'avdelinger/bergen',
          title: 'Bergen',
        },
      ],
    },
  ],
};

export default function GeneralLayout({
  frontmatter,
  toc,
  noSidebar = false,
  children,
}: LayoutProps) {
  const subHeadings = toc[0]?.children;
  const modalRef = React.createRef<HTMLDivElement>();
  const closeRef = React.createRef<HTMLDivElement>();
  const waveVisible = useOnScreen(waveRef);

  const { isMenuVisible, setMenuVisible, tabIndex } = useTogglableBurgerMenu(
    modalRef,
    closeRef,
  );

  const [scrollPosition, setscrollPosition] = useState(0);

  const handleScroll = () => {
    const position = window.pageYOffset;
    setscrollPosition(position);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const [activeHeading, setActiveHeading] = useState('');

  const { asPath } = useRouter();

  const currentCategory = metadata.categories.find((category) =>
    isActiveHandbook(category.path, asPath, true),
  );

  const classes = and(style.main, !noSidebar ? style.main__sidebar : undefined);

  return (
    <div className={classes}>
      <Head>
        <title>{frontmatter?.title ?? title}</title>
        <link rel="icon" href={favicon} />
        <link rel="manifest" href="/manifest.json" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@variant_as" />
        <meta property="og:title" content={frontmatter?.title ?? title} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://handbook.variant.no/" />
        <meta
          property="og:image"
          content="https://www.variant.no/og-header-min.png"
        />
      </Head>
      <header
        className={isLandingpage(asPath) ? style.header__dark : style.header}
      >
        <ul
          className={
            isLandingpage(asPath) && (waveVisible || scrollPosition < 500)
              ? style.header__handbooks__dark
              : style.header__handbooks
          }
        >
          {metadata.handbooks.map((handbook, index) => (
            <li
              key={handbook.title}
              className={
                isActiveHandbook(handbook.path, asPath) &&
                !isLandingpage(asPath)
                  ? style.header__handbooks__link__active
                  : isActiveHandbook(handbook.path, asPath) &&
                    isLandingpage(asPath) &&
                    (waveVisible || scrollPosition < 500)
                  ? style.header__handbooks__link__dark__active
                  : isLandingpage(asPath) &&
                    (waveVisible || scrollPosition < 500)
                  ? style.header__handbooks__link__dark
                  : style.header__handbooks__link
              }
            >
              <Link href={`/${handbook.path}`}>
                <a tabIndex={tabIndex}>{`${index + 1}.${handbook.title}`}</a>
              </Link>
            </li>
          ))}

          <li className={style.header__handbooks__search}>
            <p>Søk</p>
            <img src={magnifyingGlass} alt="" role="none" />
            <img src={searchBlob} alt="" role="none" />
          </li>
        </ul>

        {!noSidebar && (
          <div className={style.burgerButtonContainer} ref={closeRef}>
            <span hidden id="menu-label">
              Hovedmeny
            </span>
            <Hamburger
              onClick={() => setMenuVisible(!isMenuVisible)}
              isOpen={isMenuVisible}
              path={asPath}
              waveVisible={waveVisible}
              scrollPosition={scrollPosition}
            />
          </div>
        )}
      </header>

      <div
        className={and(
          style.nav__background,
          isMenuVisible ? style.nav__background__active : ' ',
        )}
      >
        <img src={navBackground} alt="" role="none" />
      </div>

      {!noSidebar && (
        <nav
          className={and(style.nav, isMenuVisible ? style.nav__active : ' ')}
          ref={modalRef}
        >
          <section className={style.nav__inner}>
            <ul className={style.nav__handbooks}>
              {metadata.handbooks.map((handbook) => {
                return (
                  <li
                    key={handbook.title}
                    className={
                      isActiveHandbook(handbook.path, asPath)
                        ? style.nav__inner__link__active
                        : style.nav__inner__link
                    }
                  >
                    <Link href={`/${handbook.path}`}>
                      <a tabIndex={tabIndex}>{handbook.title}</a>
                    </Link>
                  </li>
                );
              })}

              {metadata.categories.map((category) => (
                <li
                  key={category.title}
                  className={
                    isActiveHandbook(category.path, asPath, true)
                      ? style.nav__inner__link__active
                      : style.nav__inner__link
                  }
                >
                  <Link href={`/${category.path}`}>
                    <a tabIndex={tabIndex}>{category.title}</a>
                  </Link>
                </li>
              ))}
            </ul>

            {currentCategory && (
              <ul className={style.nav__handbooks}>
                {currentCategory.handbooks.map((handbook) => {
                  return (
                    <li
                      key={handbook.title}
                      className={
                        isActiveHandbook(handbook.path, asPath)
                          ? style.nav__inner__link__active
                          : style.nav__inner__lin
                      }
                    >
                      <Link href={`/${handbook.path}`}>
                        <a tabIndex={tabIndex}>{handbook.title}</a>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            {subHeadings.length > 0 ? (
              <>
                <li className={style.header__handbooks__back}>
                  <img src={backArrow} alt="" role="none" />
                  <a href="">Til variant.no</a>
                </li>
                <ul>
                  {subHeadings.map((heading) => {
                    return (
                      <div onClick={() => setActiveHeading(heading.value)}>
                        <NavbarLinks
                          heading={heading}
                          tabIndex={tabIndex}
                          isOpen={activeHeading == heading.value}
                        />
                      </div>
                    );
                  })}
                </ul>
              </>
            ) : null}
          </section>

          <LoginForm />
        </nav>
      )}
      <section className={style.content}>{children}</section>

      <BackgroundBlobs />

      <footer className={style.footer}>
        <div className={style.footer__inner}>
          <ul className={style.footer__social}>
            <li>
              <a
                href="https://blog.variant.no"
                title="Variant Blogg"
                rel="external"
              >
                <img
                  src={require('./logos/medium.svg')}
                  alt="Variant på Medium.com"
                />
              </a>
            </li>
            <li>
              <a
                href="https://twitter.com/variant_as"
                title="Variant på Twitter"
                rel="external"
              >
                <img
                  src={require('./logos/twitter.svg')}
                  alt="Variant på Twitter"
                />
              </a>
            </li>
            <li>
              <a
                href="https://github.com/varianter"
                title="Variant på Github"
                rel="external"
              >
                <img
                  src={require('./logos/github.svg')}
                  alt="Variant på Github"
                />
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com/variant_as"
                title="Variant på Instagram"
                rel="external"
              >
                <img
                  src={require('./logos/instagram.svg')}
                  alt="Variant på Instagram"
                />
              </a>
            </li>
            <li>
              <a
                href="https://fb.me/varianter"
                title="Variant på Facebook"
                rel="external"
              >
                <img
                  src={require('./logos/facebook.svg')}
                  alt="Variant på Facebook"
                />
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/company/variant-as/"
                title="Variant på LinkedIn"
                rel="external"
              >
                <img
                  src={require('./logos/linkedin.svg')}
                  alt="Variant på LinkedIn"
                />
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = getAuthServerSideProps;

type HamburgerProps = {
  isOpen: boolean;
  onClick: () => void;
  path: string;
  waveVisible: boolean;
  scrollPosition: number;
};

function Hamburger({
  isOpen,
  onClick,
  path,
  waveVisible,
  scrollPosition,
}: HamburgerProps) {
  return (
    <button
      className={and(
        isLandingpage(path) && (waveVisible || scrollPosition < 500)
          ? style.hamburger__dark
          : style.hamburger,
        isOpen ? style.hamburger__open : undefined,
      )}
      type="button"
      aria-labelledby="menu-label"
      aria-expanded={isOpen}
      onClick={onClick}
    >
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </button>
  );
}

function useTogglableBurgerMenu<T extends HTMLElement, R extends HTMLElement>(
  modalRef: React.RefObject<T>,
  closeButton: React.RefObject<R>,
  breakpointMinWidth = '1200px',
) {
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const isNotHamburgerMode =
    useMediaQuery(`(min-width: ${breakpointMinWidth})`) ?? true;

  useEffect(() => {
    setTabIndex(isMenuVisible || isNotHamburgerMode ? 0 : -1);

    // Avoid scrolling when menu is visible.
    if (isMenuVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'initial';
    }
  }, [isMenuVisible, isNotHamburgerMode]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!isMenuVisible || closeButton.current?.contains(e.target as Node)) {
        return;
      }
      if (!e.target || !modalRef.current?.contains(e.target as Node)) {
        return setMenuVisible(false);
      }
      if ((e.target as Node).nodeName === 'A') {
        return setMenuVisible(false);
      }
    };
    document.body.addEventListener('click', handleClickOutside);
    return () => document.body.removeEventListener('click', handleClickOutside);
  }, [isMenuVisible, modalRef, closeButton]);

  const handleTabKey = useCallback(
    (e: KeyboardEvent) => {
      const focusableModalElements =
        modalRef.current?.querySelectorAll<HTMLElement>(
          '[role="button"],a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select',
        ) ?? [];
      const allFocusables =
        document.querySelectorAll<HTMLElement>(
          '[role="button"],a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select',
        ) ?? [];

      const first = focusableModalElements[0];
      const last = focusableModalElements[focusableModalElements.length - 1];
      const next =
        Array.from(allFocusables).find(
          (_, i) => allFocusables[i - 1] === document.activeElement,
        ) ?? null;
      const previous =
        Array.from(allFocusables).find(
          (_, i) => allFocusables[i + 1] === document.activeElement,
        ) ?? null;

      // On normal tabbing. If next element is outside modal, jump to first element
      if (!e.shiftKey && !modalRef.current?.contains(next)) {
        first?.focus();
        return e.preventDefault();
      }

      // On "reversed" tabbing. If previous element is outside modal, jump to last element
      if (e.shiftKey && !modalRef.current?.contains(previous)) {
        last?.focus();
        return e.preventDefault();
      }

      // Not start or end, follow normal tab flow.
    },
    [modalRef],
  );
  useEffect(() => {
    function keyListener(e: KeyboardEvent) {
      if (!isMenuVisible || isNotHamburgerMode) {
        return;
      }
      if (e.key === 'Escape') {
        return setMenuVisible(false);
      }
      if (e.key === 'Tab') {
        return handleTabKey(e);
      }
    }
    document.addEventListener('keydown', keyListener);
    return () => document.removeEventListener('keydown', keyListener);
  }, [isMenuVisible, isNotHamburgerMode, handleTabKey]);

  return {
    isMenuVisible,
    setMenuVisible,
    tabIndex,
  };
}

function hasWindow() {
  return typeof window !== 'undefined';
}

const useMediaQuery = (mediaQuery: string) => {
  const [isMatched, setMatched] = useState(() => {
    if (!hasWindow()) return false;
    return Boolean(window.matchMedia(mediaQuery).matches);
  });

  useEffect(() => {
    if (!hasWindow()) return;
    const mediaQueryList = window.matchMedia(mediaQuery);
    const documentChangeHandler = () =>
      setMatched(Boolean(mediaQueryList.matches));
    listenTo(mediaQueryList, documentChangeHandler);

    documentChangeHandler();
    return () => removeListener(mediaQueryList, documentChangeHandler);
  }, [mediaQuery]);

  return isMatched;
};

function listenTo(
  matcher: MediaQueryList,
  cb: (ev: MediaQueryListEvent) => void,
) {
  if ('addEventListener' in (matcher as any)) {
    return matcher.addEventListener('change', cb);
  }
  return matcher.addListener(cb);
}

function removeListener(
  matcher: MediaQueryList,
  cb: (ev: MediaQueryListEvent) => void,
) {
  if ('removeEventListener' in (matcher as any)) {
    return matcher.removeEventListener('change', cb);
  }
  return matcher.removeListener(cb);
}

export const waveRef = React.createRef<HTMLImageElement>();

function useOnScreen(ref: React.RefObject<HTMLImageElement>) {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) =>
      setIntersecting(entry.isIntersecting),
    );
    if (ref.current != null) observer.observe(ref.current);
    // Remove the observer as soon as the component is unmounted
    return () => {
      observer.disconnect();
    };
  }, []);

  return isIntersecting;
}
