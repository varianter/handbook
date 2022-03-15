import { by } from "@pabra/sortby";
import algoliasearch from "algoliasearch/lite";
import Link from "next/link";
import { useRouter } from "next/router";
import qs from "qs";
import React, { useState } from "react";
import { Hit } from "react-instantsearch-core";
import {
  Configure,
  Highlight,
  Hits,
  InstantSearch,
  Pagination,
  RefinementList,
  SearchBox,
} from "react-instantsearch-dom";
import { useUserdata } from "src/auth";
import GeneralLayout from "src/layouts/general";
import style from "./search.module.css";

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "";
const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_READ_KEY || "";
const searchClient = algoliasearch(appId, apiKey);

const parseString = (path: string) => qs.parse(path.split("?")[1]);
export default function Search() {
  const router = useRouter();
  const query = parseString(router.asPath);
  const [searchState, setSearchState] = useState(query);

  const userInfo = useUserdata();

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
        <Configure hitsPerPage={8} />

        <div className={style.searchInputs}>
          <SearchBox
            autoFocus
            translations={{
              placeholder: "Hva leter du etter?",
            }}
          />
          <RefinementList
            defaultRefinement={userInfo?.department}
            attribute="department"
            transformItems={(items: any[]) => items.sort(by("label"))}
          />
        </div>

        <Hits hitComponent={Hit} />
        <Pagination />
      </InstantSearch>
    </GeneralLayout>
  );
}

type HitProps = { hit: Hit<any> };
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
