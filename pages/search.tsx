import algoliasearch from "algoliasearch/lite";
import React, { useEffect, useState } from "react";
import {
  InstantSearch,
  Hits,
  SearchBox,
  Pagination,
  Highlight,
  Configure,
} from "react-instantsearch-dom";
import { Hit } from "react-instantsearch-core";
import GeneralLayout from "src/layouts/general";
import style from "src/search/search.module.css";
import Link from "next/link";
import { useRouter } from "next/router";

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "";
const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_READ_KEY || "";
const searchClient = algoliasearch(appId, apiKey);

export default function Search() {
  const router = useRouter();
  const [searchState, setSearchState] = useState(router.query);

  function onSearchStateChange(updatedSearchState: any) {
    setSearchState(updatedSearchState);
    router.replace({ query: updatedSearchState }, undefined, { shallow: true });
  }

  useEffect(() => {
    setSearchState(router.query);
  }, [router.query]);

  return (
    <GeneralLayout toc={[]} meta={{ title: "Søk" }}>
      <h2>Søk</h2>
      <InstantSearch
        indexName="handbook_content"
        searchClient={searchClient}
        searchState={searchState}
        onSearchStateChange={onSearchStateChange}
        createURL={(searchState) => `?q=${searchState.query}`}
      >
        <Configure hitsPerPage={8} />
        <SearchBox autoFocus />
        <Hits hitComponent={Hit} />
        <Pagination />
      </InstantSearch>
    </GeneralLayout>
  );
}

type HitProps = { hit: Hit<any> };
function Hit({ hit }: HitProps) {
  console.log(hit);
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
