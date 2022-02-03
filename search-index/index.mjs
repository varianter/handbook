import glob from "fast-glob";
import { dirname, join } from "path";
import { vfileToAst } from "../mdx-plugins/index.mjs";
import { read } from "to-vfile";
import { visit } from "unist-util-visit";
import slugify from "slugify";
import { selectAll } from "unist-util-select";

import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

// const pagesGlob = join(__dirname, "../pages/**/*.{md,mdx}");
// const files = await glob(pagesGlob);
// const results = await Promise.all(files.map(fileToAst));

const file = join(__dirname, "../pages/index.mdx");
const result = await toFileIndexes(file);
console.log(result);

async function toFileIndexes(file) {
  const ast = await fileToAst(file);
  const urlPath = fileToUrl(file);

  return getParagraphsWithSlugFromRoot(urlPath, ast);
}

async function fileToAst(file) {
  const vfile = await read(file, "utf8");
  return vfileToAst(vfile);
}

function fileToUrl(file) {
  const path = file.replace(/^.*?pages/, "").replace(/\.mdx?$/, "");
  if (path === "/index") {
    return "/";
  }
  return path;
}

function getParagraphsWithSlugFromRoot(urlPath, tree) {
  let currentHeadingSlug = null;
  let data = [];
  for (let node of tree.children) {
    if (node.type === "heading") {
      currentHeadingSlug = slugify(getTextValue(node));
      continue;
    }

    let content = getAllTextsFromNodes(node);
    if (content == "") {
      continue;
    }

    data = data.concat({
      slug: currentHeadingSlug,
      content,
      urlPath,
      url: `${urlPath}#${currentHeadingSlug}`,
    });
  }
  return data;
}

function getAllTextsFromNodes(node) {
  const nodes = selectAll("paragraph, list", node);
  let text = "";
  for (let node of nodes) {
    text += getTextValue(node);
  }
  return text;
}

function getTextValue(node) {
  let str = "";
  visit(node, "text", function (item) {
    str += item.value;
  });
  return str;
}
