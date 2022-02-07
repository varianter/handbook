import glob from "fast-glob";
import { vfileToAst } from "../mdx-plugins/index.mjs";
import { read } from "to-vfile";
import { visit } from "unist-util-visit";
import slugify from "slugify";
import { selectAll } from "unist-util-select";

export function createIndexer(baseUrl) {
  function _createIndexer(filesGlobs = [], nodeMapper = {}) {
    return {
      addGlob(glob) {
        return _createIndexer(filesGlobs.concat(glob), nodeMapper);
      },
      mapNodes(node, mapping) {
        return _createIndexer(filesGlobs, {
          ...nodeMapper,
          [node]: mapping,
        });
      },
      generateIndexes: async function generateIndexes() {
        const files = await glob(filesGlobs);
        const indexer = createFileIndexer(baseUrl, nodeMapper);
        const result = await Promise.all(files.map(indexer));
        return result.flat();
      },
    };
  }

  return _createIndexer();
}

export function getTextValue(node) {
  let str = "";
  visit(node, "text", function (item) {
    str += item.value;
  });
  return str;
}

function createFileIndexer(baseUrl, nodeMapper) {
  return async function toFileIndexes(file) {
    const ast = await fileToAst(file);
    const urlPath = fileToUrl(file);
    return getMappedDataWithHeadings(nodeMapper, baseUrl, urlPath, ast);
  };
}

export async function fileToAst(file) {
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

function getMappedDataWithHeadings(nodeMapper, baseUrl, urlPath, tree) {
  let currentHeading = null;
  let data = [];
  for (let node of tree.children) {
    if (node.type === "heading") {
      currentHeading = getTextValue(node);
      continue;
    }

    for (let [nodeSelector, mapping] of Object.entries(nodeMapper)) {
      const slug = slugify(currentHeading);
      const mappedData = doMapping(nodeSelector, mapping, node, tree, {
        slug,
        title: currentHeadingSlug,
        urlPath,
        url: `${baseUrl}${urlPath}#${slug}`,
      });

      if (mappedData) {
        data = data.concat(mappedData);
      }
    }
  }
  return data;
}

function doMapping(nodeSelector, mapping, node, tree, data) {
  return selectAll(nodeSelector, node).map(function (innerNode) {
    const content = getTextValue(innerNode);

    return mapping(
      {
        ...data,
        content,
      },
      innerNode,
      nodeSelector,
      tree
    );
  });
}
