import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { simple } from 'instantsearch.js/es/lib/stateMappings';
import qs from 'qs';

import style from './search.module.css';

const stateMapping = simple();

type SearchFormProps = {
  currentSearch: string;
  autofocus?: boolean;
};
export function SearchBox(props: SearchFormProps) {
  return (
    <div className={style.container}>
      <div className={style.face_decoration}>
        <svg
          width="21"
          height="26"
          viewBox="0 0 21 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.1123 2V9.46511H13.1891"
            stroke="#282828"
            stroke-width="3.61593"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M18.4079 2V3.32584"
            stroke="#282828"
            stroke-width="3.61593"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M1.81803 2V3.32584"
            stroke="#282828"
            stroke-width="3.61593"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle
            cx="11.3181"
            cy="20.53"
            r="3.61594"
            stroke="#282828"
            stroke-width="3.61593"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <h2>Søk etter innhold</h2>
      <SearchForm {...props} />
    </div>
  );
}

export default function SearchForm({
  currentSearch,
  autofocus = false,
}: SearchFormProps) {
  const [searchQuery, setSearchQuery] = useState(currentSearch ?? '');
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);

  useHotkeys('shift+cmd+p,shift+ctrl+p', () => {
    ref.current?.focus();
  });

  useEffect(() => {
    if (autofocus) {
      ref.current?.focus();
    }
  }, [autofocus]);

  const performSearch = () => {
    const s = stateMapping.stateToRoute({
      handbook_content: {
        query: searchQuery,
      },
    });
    const q = qs.stringify(s, {
      addQueryPrefix: false,
      arrayFormat: 'repeat',
    });

    router.push({
      pathname: `/search`,
      query: q,
    });
  };

  return (
    <form
      className={style.searchform}
      onSubmit={(e) => {
        e.preventDefault();
        performSearch();
      }}
    >
      <input
        defaultValue={searchQuery}
        placeholder="Hva leter du etter?"
        onChange={(e) => setSearchQuery(e.target.value)}
        ref={ref}
        autoFocus={autofocus}
      />
      <button type="submit">Søk</button>
    </form>
  );
}
