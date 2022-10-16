import React from 'react';

export type LayoutProps = React.PropsWithChildren<{
  frontmatter: Frontmatter;
  toc: Toc;
  currentSearch?: string;
  noSidebar?: boolean;
}>;
