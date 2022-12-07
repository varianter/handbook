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
} from 'react-instantsearch-hooks-web';

import type { Hit as AlgoliaHit } from 'instantsearch.js';
import { history } from 'instantsearch.js/es/lib/routers/index.js';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { getServerState } from 'react-instantsearch-hooks-server';

import Link from 'next/link';
import { Userdata, useUserdata } from 'src/auth';
import GeneralLayout from 'src/layouts/general';

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_READ_KEY || '';
const searchClient = algoliasearch(appId, apiKey);

import style from 'src/search/search.module.css';

const SEARCH_HITS_PER_PAGE = 8;

type SearchPageProps = {
  serverState?: InstantSearchServerState;
  url?: string;
};

export default function Search(props: SearchPageProps) {
  const userInfo = useUserdata();

  return (
    <GeneralLayout toc={[]} frontmatter={{ title: 'Søk' }} noSidebar>
      <h2>Hva leter du etter?</h2>
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

        <div className={style.searchInputs}>
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

function RecentSearches() {
  const recentSearches: any[] = [
    {label: 'Lønnskalkulator', color: 'var(--color-primary__tint4)'}, 
    {label: 'Aksjer', color: 'var(--color-secondary1__tint4)'}, 
    {label: 'Fordeler', color: 'var(--color-secondary2__tint4)'}, 
    {label: 'Miljøfyrtårn', color: 'var(--color-secondary3__tint4)'}, 
  ];

  const results: any = [];
  recentSearches.forEach((search, index) => {
    results.push(
      <div key={index} style={{backgroundColor: search.color}} className={style.recentSearchChip} onClick={() => updateSearch(search.label)}>
        {search.label}
      </div>
      );
  });

  return (
    <div className={style.recentSearchesContainer}>
      <h3 className={style.subHeader}>Andre har søkt etter</h3>
      <div className={style.recentSearchChipsContainer}>
        {results}
      </div>
    </div>
  )
}

function updateSearch(term: string) {
  
  console.log(term);
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
