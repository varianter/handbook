import { dirname, join } from "path";
import { createIndexer } from "./indexer.mjs";
import { selectAttributeValue } from "./tree-tools.mjs";

const baseUrl = process.env.BASE_URL || "";
if (process.env.NODE_ENV === "production" && baseUrl === "") {
  throw new Error("Please set the BASE_URL environment variable");
}

import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

// const pagesGlob = join(__dirname, "../pages/**/*.{md,mdx}");
// const files = await glob(pagesGlob);
// const results = await Promise.all(files.map(fileToAst));

const indexer = createIndexer(baseUrl);

const file = join(__dirname, "../pages/index.mdx");

const result = await indexer
  .addGlob(file)
  .addNodeData("paragraph, list")
  .addNodeMap("mdxJsxFlowElement[name=DepartmentItem]", function (data, node) {
    const val = selectAttributeValue("[name=dep]", node);
    const department = Array.isArray(val) ? val : [val];
    return {
      ...data,
      department,
    };
  })
  .generateIndexes();

console.log(result);
