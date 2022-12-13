import algoliasearch from 'algoliasearch/lite';
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

import type { Hit as AlgoliaHit } from 'instantsearch.js';
import { history } from 'instantsearch.js/es/lib/routers/index.js';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { getServerState } from 'react-instantsearch-hooks-server';

import Link from 'next/link';
import { Userdata, useUserdata } from 'src/auth';
import GeneralLayout from 'src/layouts/general';
import style from 'src/search/search.module.css';

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
      <h2 style={{ paddingTop: '3.375rem' }}>Hva leter du etter?</h2>
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
          <a>
            <Highlight attribute="title" hit={hit} />
          </a>
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
          <SearchBox autoFocus placeholder="Skriv her" />
          <div className={style.searchDivider} />
          <RecentSearches />
        </div>

        <Hits hitComponent={Hit} />
        <Pagination />
      </InstantSearch>
    </InstantSearchSSRProvider>
  );
}

function CloseSearch() {
  return (
    <div className={style.closeSearchContainer}>
      <div className={style.closeSearch}>
        <button
          className={style.closeSearchButton}
          onClick={() => {
            console.log('Will close search');
          }}
        >
          Lukk
          <svg
            className={style.closeSearchIcon}
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="0.777268"
              y1="14.2929"
              x2="13.7774"
              y2="1.2928"
              stroke="#F9F7F2"
              stroke-width="2"
            />
            <line
              x1="1.19148"
              y1="1.29289"
              x2="14.1916"
              y2="14.293"
              stroke="#F9F7F2"
              stroke-width="2"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

function RecentSearches() {
  const { setIndexUiState } = useInstantSearch();

  const recentSearches: any[] = [
    { label: 'Lønn', color: 'var(--color-primary__tint4)' },
    { label: 'Aksjer', color: 'var(--color-secondary1__tint4)' },
    { label: 'Fordeler', color: 'var(--color-secondary2__tint4)' },
    { label: 'Miljøfyrtårn', color: 'var(--color-secondary3__tint4)' },
  ];

  // TODO: add condition
  if (true)
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

export async function getServerSideProps({
  req,
}: GetServerSidePropsContext): Promise<
  GetServerSidePropsResult<SearchPageProps>
> {
  const protocol = req.headers.referer?.split('://')[0] || 'https';
  const url = `${protocol}://${req.headers.host}${req.url}`;
  const serverState = await getServerState(<SearchPage url={url} />);

  return {
    props: {
      serverState,
      url,
    },
  };
}
