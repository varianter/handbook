import algoliasearch from 'algoliasearch/lite';
import { renderToString } from 'react-dom/server';
import {
  Configure,
  Highlight,
  Hits,
  InstantSearch,
  InstantSearchServerState,
  InstantSearchSSRProvider,
  Pagination,
  SearchBox,
  useInstantSearch,
} from 'react-instantsearch-hooks-web';
import useSWR from 'swr';

import type { Hit as AlgoliaHit } from 'instantsearch.js';
import { history } from 'instantsearch.js/es/lib/routers/index.js';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { getServerState } from 'react-instantsearch-hooks-server';

import Image from 'next/image';
import Link from 'next/link';
import clear from 'public/assets/illustrations/clear.svg';
import { useState } from 'react';
import { Userdata, useUserdata } from 'src/auth';
import GeneralLayout from 'src/layouts/general';
import style from 'src/search/search.module.css';
import useDebounce from 'src/utils/use-debounce';
import Button from 'src/components/button';

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_READ_KEY || '';
const searchClient = algoliasearch(appId, apiKey);

const SEARCH_HITS_PER_PAGE = 8;

type SearchPageProps = {
  serverState?: InstantSearchServerState;
  url?: string;
};

export default function Search(props: SearchPageProps) {
  const userInfo = useUserdata();

  return (
    <GeneralLayout toc={[]} frontmatter={{ title: 'Søk' }} noSidebar>
      <CloseSearch />
      <h2 className={style.header}>Hva leter du etter?</h2>
      <SearchPage {...props} userInfo={userInfo} />
    </GeneralLayout>
  );
}

type HitProps = {
  hit: AlgoliaHit<{
    slug: string;
    urlPath: string;
    title: string;
    content: string;
  }>;
};

function Hit({ hit }: HitProps) {
  return (
    <article className={style.searchItem}>
      <h3>
        <Link href={`${hit.urlPath}#${hit.slug}`}>
          <Highlight attribute="title" hit={hit} />
        </Link>
      </h3>
      <Highlight attribute="content" hit={hit} />
    </article>
  );
}

type SearchPagePropsWithUser = SearchPageProps & {
  userInfo?: Userdata;
};

function SearchPage(props: SearchPagePropsWithUser) {
  const { serverState, url } = props;

  return (
    <InstantSearchSSRProvider {...serverState}>
      <InstantSearch
        searchClient={searchClient}
        indexName="handbook_content"
        routing={{
          router: history({
            getLocation() {
              if (typeof window === 'undefined') {
                return new URL(url!) as unknown as Location;
              }

              return window.location;
            },
          }),
        }}
      >
        <Configure hitsPerPage={SEARCH_HITS_PER_PAGE} />

        <div>
          <SearchBox autoFocus placeholder="Søk eller still spørsmål..." />
          <div className={style.searchDivider} />

          <RecentSearches />
        </div>

        <ChatGPTResults />
        <Hits hitComponent={Hit} />
        <HandleNoHits />
        <Pagination />
      </InstantSearch>
    </InstantSearchSSRProvider>
  );
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function ChatGPTResults() {
  const { indexUiState } = useInstantSearch();
  const [hidden, setHidden] = useState(true);
  const debouncedQuery = useDebounce(indexUiState.query);
  const { data, isLoading } = useSWR<{ result: string[] }>(
    () =>
      debouncedQuery && !hidden ? `/api/chat?query=${debouncedQuery}` : null,
    fetcher,
  );

  let buttonText = hidden ? 'Vis' : 'Skjul';
  if (isLoading) {
    buttonText = 'Laster...';
  }

  const header = (
    <header>
      <span className={style.beta__pill}>beta</span>
      <div className={style.chatResult__title}>
        <h3>GPT-svar*</h3>
        <small className={style.chatResult__notice}>
          (*bruk av GPT sender søketeksten din til OpenAI)
        </small>
      </div>

      <div className={style.chatResult__button}>
        <Button
          onClick={() => setHidden((h) => !h)}
          aria-expanded={!hidden}
          aria-controls="gpt-result"
        >
          {buttonText}
        </Button>
      </div>
    </header>
  );

  if (!indexUiState.query) {
    return null;
  }

  if (hidden) {
    return <aside className={style.chatResult}>{header}</aside>;
  }

  const result =
    data?.result?.join('...') ?? 'Beep boop. Fant ingen resultater...';

  return (
    <aside className={style.chatResult}>
      {header}
      <div
        className={style.chatResult__result}
        role="region"
        id="gpt-result"
        aria-busy={isLoading}
        aria-describedby="progress-bar"
      >
        {isLoading ? (
          <div className={style.chatResult__loading}>
            <progress id="progress-bar" aria-label="Laster..."></progress>
            <p>Henter svar...</p>
          </div>
        ) : (
          <p>{result}</p>
        )}

        <hr />
        <em className={style.chatResult__nb}>
          OBS: Dette er i prøvefase og svaret kan i mange tilfeller ikke være
          komplett eller korrekt. Verifiser alltid med håndboken direkte om det
          er noe kritisk.
        </em>
      </div>
    </aside>
  );
}

function CloseSearch() {
  return (
    <div className={style.closeSearchContainer}>
      <div className={style.closeSearch}>
        <Link href={'./'}>
          <span className={style.closeSearchButton}>
            Lukk
            <Image
              className={style.closeSearchIcon}
              priority
              src={clear}
              height={15}
              width={15}
              alt={'Close'}
            />
          </span>
        </Link>
      </div>
    </div>
  );
}

function RecentSearches() {
  const { indexUiState, setIndexUiState } = useInstantSearch();

  const recentSearches: any[] = [
    { label: 'Lønn', color: 'var(--color-primary__tint4)' },
    { label: 'Aksjer', color: 'var(--color-secondary1__tint4)' },
    { label: 'Fordeler', color: 'var(--color-secondary2__tint4)' },
    { label: 'Miljøfyrtårn', color: 'var(--color-secondary3__tint4)' },
  ];

  if (!indexUiState.query)
    return (
      <div className={style.recentSearchesContainer}>
        <h3 className={style.subHeader}>Andre har søkt etter</h3>
        <div className={style.recentSearchChipsContainer}>
          {recentSearches.map((search, index) => (
            <button
              type="button"
              key={index}
              style={{ backgroundColor: search.color, cursor: 'pointer' }}
              className={style.recentSearchChip}
              onClick={() => {
                setIndexUiState({ query: search.label });
              }}
            >
              {search.label}
            </button>
          ))}
        </div>
      </div>
    );

  return null;
}

function HandleNoHits() {
  const { results } = useInstantSearch();
  if (results.nbHits > 0) return null;

  return (
    <div className={style.noHits}>🔎 Ingen direkte søkeresultater funnet.</div>
  );
}

export async function getServerSideProps({
  req,
}: GetServerSidePropsContext): Promise<
  GetServerSidePropsResult<SearchPageProps>
> {
  const protocol = req.headers.referer?.split('://')[0] || 'https';
  const url = `${protocol}://${req.headers.host}${req.url}`;
  const serverState = await getServerState(<SearchPage url={url} />, {
    renderToString,
  });

  return {
    props: {
      serverState,
      url,
    },
  };
}
