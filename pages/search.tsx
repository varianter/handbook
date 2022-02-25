import algoliasearch from "algoliasearch/lite";
import React, { useState } from "react";
import {
  InstantSearch,
  Hits,
  SearchBox,
  Pagination,
  Highlight,
  Configure,
  ClearRefinements,
  RefinementList,
} from "react-instantsearch-dom";
import { Hit } from "react-instantsearch-core";
import GeneralLayout from "src/layouts/general";
import style from "src/search/search.module.css";
import Link from "next/link";
import { useRouter } from "next/router";
import qs from "qs";
import { by } from "@pabra/sortby";

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "";
const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_READ_KEY || "";
const searchClient = algoliasearch(appId, apiKey);

const parseString = (path: string) => qs.parse(path.split("?")[1]);
export default function Search() {
  const router = useRouter();
  const query = parseString(router.asPath);
  const [searchState, setSearchState] = useState(query);

  function onSearchStateChange(updatedSearchState: any) {
    setSearchState(updatedSearchState);
    router.replace({ query: qs.stringify(updatedSearchState) }, undefined, {
      shallow: true,
    });
  }

  return (
    <GeneralLayout toc={[]} meta={{ title: "Søk" }}>
      <h2>Søk</h2>
      <InstantSearch
        indexName="handbook_content"
        searchClient={searchClient}
        searchState={searchState}
        onSearchStateChange={onSearchStateChange}
      >
        <ClearRefinements />
        <RefinementList
          attribute="department"
          transformItems={(items: any[]) => items.sort(by("label"))}
        />
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
