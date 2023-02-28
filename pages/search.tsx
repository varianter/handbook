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
  RefinementList,
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
      <h2>Søk</h2>
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

        <div className={style.searchInputs}>
          <SearchBox autoFocus placeholder="Hva leter du etter?" />
          <RefinementList
            attribute="department"
            sortBy={['name:desc']}
            classNames={{
              count: style.refinement__pill,
              labelText: style.refinement__labelText,
              label: style.refinement__label,
            }}
          />
        </div>

        <Hits hitComponent={Hit} />
        <Pagination />
      </InstantSearch>
    </InstantSearchSSRProvider>
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
