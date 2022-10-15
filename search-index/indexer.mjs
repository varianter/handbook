import glob from 'fast-glob';
import { vfileToAst } from '../mdx-plugins/index.mjs';
import { read } from 'to-vfile';
import slugify from 'slugify';
import fm from 'gray-matter';
import { selectAll } from 'unist-util-select';
import { getTextValue } from './tree-tools.mjs';
import isEqual from 'lodash.isequal';

export function createIndexer(metadata) {
  function _createIndexer(filesGlobs = [], nodeMapper = {}) {
    return {
      addGlob(glob) {
        return _createIndexer(filesGlobs.concat(glob), nodeMapper);
      },
      addNodeMap(node, mapping) {
        return _createIndexer(filesGlobs, {
          ...nodeMapper,
          [node]: mapping,
        });
      },
      addNodeData(node) {
        return _createIndexer(filesGlobs, {
          ...nodeMapper,
          [node]: dataIdentity,
        });
      },
      generateIndexes: async function generateIndexes() {
        const files = await glob(filesGlobs);
        const indexer = createFileIndexer(metadata, nodeMapper);
        const result = await Promise.all(files.map(indexer));
        return result.flat();
      },
    };
  }

  return _createIndexer();
}

function dataIdentity(data) {
  return data;
}

function createFileIndexer(metadata, nodeMapper) {
  return async function toFileIndexes(file) {
    const { ast, matter } = await parseFile(file);
    const urlPath = fileToUrl(file);
    return getMappedDataWithHeadings(
      nodeMapper,
      metadata,
      matter.data,
      urlPath,
      ast,
    );
  };
}

export async function parseFile(file) {
  const vfile = await read(file, 'utf8');
  return { ast: await vfileToAst(vfile), matter: fm(vfile.toString()) };
}

function fileToUrl(file) {
  const path = file.replace(/^.*?pages/, '').replace(/\.mdx?$/, '');
  if (path === '/index') {
    return '/';
  }
  return path;
}

function getMappedDataWithHeadings(
  nodeMapper,
  metadata,
  matter,
  urlPath,
  tree,
) {
  let currentHeading = null;
  let contentList = [];

  for (let node of tree?.children ?? []) {
    if (node.type === 'heading') {
      currentHeading = getTextValue(node);
    }

    for (let [nodeSelector, mapping] of Object.entries(nodeMapper)) {
      const slug = currentHeading ? slugify(currentHeading) : null;
      const result = doMapping(nodeSelector, mapping, node, tree, {
        slug,
        title: currentHeading,
        urlPath,
        matter,
        systemId: metadata.systemId,
        url: `${metadata.baseUrl}${urlPath}#${slug}`,
      });

      const uniqueContent = result.reduce(function (acc, mappedData) {
        if (isTextFromBefore(mappedData, contentList)) {
          return acc;
        }
        return acc.concat(mappedData);
      }, []);

      contentList = contentList.concat(uniqueContent);
    }
  }
  return contentList;
}

function isTextFromBefore(current, previous) {
  return previous.some(function (visited) {
    return isEqual(visited.content, current.content);
  });
}
function doMapping(nodeSelector, mapping, node, tree, data) {
  return selectAll(nodeSelector, node)
    .map(function (innerNode) {
      const output = mapping(
        {
          ...data,
          content: getTextValue(innerNode),
        },
        innerNode,
        nodeSelector,
        tree,
      );
      return output;
    })
    .filter(Boolean);
}
