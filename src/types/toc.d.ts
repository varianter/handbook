type TocItem = {
  depth: number;
  value: string;
  attributes: {
    id: string | undefined;
    className: string | undefined;
  };
  children: TocItem[];
};
type Toc = TocItem[];
