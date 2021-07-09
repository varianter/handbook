import { NextApiRequest, NextApiResponse } from "next";
import { getHandbookData, HandbookData, Handbooks } from "src/utils";

let handbooks: Handbooks;
let handBookParagraphs: (SearchResult & {
  headerTags: string[];
  contentTags: string[];
})[];

let invertedSearchIndex: { [word: string]: string[] };
let searchIndexCreated = false;

function getMatchingProps(obj: any, searchWord: string) {
  const pattern = new RegExp(searchWord, "g");
  const results = [];
  for (let prop in obj) if (pattern.test(prop)) results.push(prop);
  return results;
}

const insertSearchKeyAndValue = (key: string, value: string) => {
  if (!invertedSearchIndex[key]) {
    invertedSearchIndex[key] = [value];
  } else {
    invertedSearchIndex[key].push(value);
  }
};

async function buildSearchIndex() {
  handbooks = await getHandbookData(true);
  handBookParagraphs = [
    ...handbooks.handbooks.flatMap((handbook) =>
      getHandBookParagraphs(handbook)
    ),
    ...handbooks.categories.flatMap((category) =>
      category.handbooks.flatMap((handbook) => getHandBookParagraphs(handbook))
    ),
  ];

  invertedSearchIndex = {};
  handBookParagraphs.forEach((handbookParagraph) => {
    splitTrimAndLowercase(handbookParagraph.header).forEach((word: string) =>
      insertSearchKeyAndValue(word, handbookParagraph.header)
    );
    handbookParagraph.contentTags.forEach((word: string) =>
      insertSearchKeyAndValue(word, handbookParagraph.header)
    );
  });

  searchIndexCreated = true;
}
async function doSearch(searchQuery: string[]): Promise<SearchResult[]> {
  if (!searchIndexCreated) {
    await buildSearchIndex();
  }

  const res = searchHandbook(searchQuery);
  return res;
}

export interface SearchResult {
  header: string;
  headerLevel: number;
  link: string;
  content: string;
  handbookTitle: string;
  handbookName: string;
}

function searchHandbook(searchQuery: string[]): SearchResult[] {
  let result: SearchResult[] = [];

  searchQuery.forEach((searchWord) => {
    let properties = getMatchingProps(invertedSearchIndex, searchWord);

    properties.forEach((property) => {
      if (invertedSearchIndex[property]) {
        invertedSearchIndex[property].forEach((title: string) => {
          let handbookParagraph = handBookParagraphs.find(
            (paragraph) => paragraph.header == title
          );
          if (
            !result.some((paragraph: SearchResult) => paragraph.header == title)
          ) {
            if (handbookParagraph) {
              result.push(handbookParagraph);
            }
          }
        });
      }
    });
  });
  return result;
}

function getHandBookParagraphs(
  handbook: HandbookData
): (SearchResult & {
  headerTags: string[];
  contentTags: string[];
})[] {
  if (!handbook.content) return [];
  let lines = handbook.content.split(/\r?\n/);
  const result = [];

  let currentheading:
    | (SearchResult & {
        headerTags: string[];
        contentTags: string[];
      })
    | null = null;

  // TODO Rewrite as lines.reduce
  for (let line of lines) {
    const titleRes = /(^#+\s*)(.*)$/.exec(line);
    if (titleRes) {
      const level = titleRes[1].trim().length;

      if (currentheading) {
        result.push(currentheading);
      }

      const header = titleRes[2];
      currentheading = {
        headerLevel: level,
        header: header,
        link: getChapterLink(handbook.path, header),
        headerTags: splitTrimAndLowercase(header),
        contentTags: [],
        content: "",
        handbookTitle: handbook.title,
        handbookName: handbook.path,
      };
    } else {
      if (!currentheading) continue;
      currentheading.contentTags = [
        ...currentheading.contentTags,
        ...splitTrimAndLowercase(line),
      ];

      currentheading.content += "\n" + line;
    }
  }
  return result;
}

function getChapterLink(handbookName: string, header: string) {
  return `/${handbookName}#${header.replace(/ /g, "-").toLowerCase()}`;
}

// We can probably find a list of these somewhere
const filterWords = [
  "det",
  "en",
  "et",
  "som",
  "for",
  "i",
  "at",
  "har",
  "å",
  "på",
];

function splitTrimAndLowercase(str: string): string[] {
  return str
    .toLowerCase()
    .replace(
      /(\r?\n|\r)|(?:\.)|(?:\,)|(?:\[)|(?:\])|(?:\()|(?:\))|(?:\*\*)|(?:\:)|(?:\?)/g,
      ""
    )
    .trim()
    .split(" ")
    .filter((x) => !filterWords.includes(x));
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const query = req.query.q;
  if (!query || Array.isArray(query)) {
    return res.status(200).json([]);
  }

  const results = await doSearch(splitTrimAndLowercase(query));
  return res.status(200).json(results);
};
