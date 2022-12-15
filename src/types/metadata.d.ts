type Frontmatter = {
  title: string;
};

type HeaderData = {
  title: string;
  order?: number;
};

type HeaderHandbook = {
  data: HeaderData;
  path: string;
  title: string;
};

type HeaderCategory = {
  path: string;
  title: string;
  handbooks: HeaderHandbook[];
};

type HeaderMetadata = {
  handbooks: HeaderHandbook[];
  categories: HeaderCategory[];
};
