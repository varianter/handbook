import React from "react";

export type LayoutProps = React.PropsWithChildren<{
  meta: Metadata;
  toc: Toc;
  currentSearch?: string;
}>;
