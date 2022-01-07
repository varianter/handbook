type TocItem = {
  depth: number;
  value: string;
  children: TocItem[];
};
type Toc = TocItem[];
