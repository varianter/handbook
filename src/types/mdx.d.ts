type TocItem = {
  depth: number;
  value: string;
  children: TocItem[];
};
type Toc = TocItem[];

declare module "*.mdx" {
  export type TocItem = TocItem;
  export type Toc = TocItem[];

  export type Meta = {
    title: string;
  };

  export const toc: TocItem;
  export const meta: Meta;
}
