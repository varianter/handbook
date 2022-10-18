declare module '*.mdx' {
  export type TocItem = TocItem;
  export type Toc = TocItem[];

  export const toc: TocItem;
  export const frontmatter: Frontmatter;
}
