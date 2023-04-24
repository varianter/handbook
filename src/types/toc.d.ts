type TocItem = {
  depth: number;
  value: string;
  attributes: {
    id: string;
    className: string;
  }
  children: TocItem[];
};
type Toc = TocItem[];
