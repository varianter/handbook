import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import { getHeadlines } from "@variant/md-section";

export type HandbookData = {
  data: { [key: string]: any };
  path: string;
  title: string;
  content: string | null;
};

export type Handbooks = {
  handbooks: HandbookData[];
  categories: {
    path: string;
    title: string;
    handbooks: HandbookData[];
  }[];
};

export type HandbookProps = {
  handbooks: Handbooks;
  content?: string;
  subHeadings: string[];
  filename: string;
};

type HandbookFiles = {
  files: string[];
  categories: {
    name: string;
    files: string[];
  }[];
};

export const getHandbookFiles = async (subDirectory = "") => {
  const filesAndDirectories = await fs.readdir(
    path.join(process.cwd(), "content", subDirectory),
    { withFileTypes: true }
  );

  const handbookFiles: HandbookFiles = {
    files: [],
    categories: [],
  };

  for (const fileOrDirectory of filesAndDirectories) {
    // Don't add index.md to the list of files. It's only used for metadata
    // about a directory.
    if (fileOrDirectory.name === "index.md") continue;

    if (fileOrDirectory.isDirectory()) {
      handbookFiles.categories.push({
        name: fileOrDirectory.name,
        ...(await getHandbookFiles(fileOrDirectory.name)),
      });
    } else {
      handbookFiles.files.push(path.join(subDirectory, fileOrDirectory.name));
    }
  }

  return handbookFiles;
};

const getMatterFile = async (
  fileName: string
): Promise<matter.GrayMatterFile<Buffer>> => {
  const file = await fs.readFile(path.join(process.cwd(), "content", fileName));
  return matter(file);
};

const getMatterInformation = async (
  pathName: string,
  includeContent: boolean
): Promise<HandbookData> => {
  const { data, content } = await getMatterFile(pathName);

  return {
    data,
    path: pathName.replace(".md", ""),
    title: data.title,
    content: includeContent ? content : null,
  };
};

export const getHandbookData = async (
  includeContent = false
): Promise<Handbooks> => {
  const handbookFiles = await getHandbookFiles();

  const handbooks = await Promise.all(
    handbookFiles.files.map(async (file) => {
      return await getMatterInformation(file, includeContent);
    })
  );

  const categories = await Promise.all(
    handbookFiles.categories.map(async (category) => {
      const { data } = await getMatterFile(`${category.name}/index.md`);

      const handbooks = await Promise.all(
        category.files.map(
          async (file) => await getMatterInformation(file, includeContent)
        )
      );

      return {
        path: category.name + "/" + data.entry.replace(".md", ""),
        title: data.title,
        handbooks: handbooks.sort((a, b) => a.data.index - b.data.index),
      };
    })
  );

  return {
    handbooks: handbooks.sort((a, b) => a.data.index - b.data.index),
    categories,
  };
};

export const getHandbookProps = async (
  handbook = "handbook"
): Promise<HandbookProps> => {
  const handbooks = await getHandbookData();
  const filename = `${handbook}.md`;

  const { content } = await getMatterFile(filename);

  const subHeadings = getHeadlines(content, {
    minLevel: 2,
    maxLevel: 2,
  }) as { level: number; content: string }[];

  return {
    handbooks,
    content,
    subHeadings: subHeadings.map((sh) => sh.content),
    filename,
  };
};
