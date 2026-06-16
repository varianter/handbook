// Shared types for layout components

export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

export interface TocItem {
  value: string;
  slug: string;
  depth: number;
  children: TocItem[];
}

export interface LayoutProps {
  frontmatter?: {
    title?: string;
    toc?: boolean;
  };
  headings?: Heading[];
  /** Content collection slug — used to build the GitHub edit URL for .md pages */
  slug?: string;
}
