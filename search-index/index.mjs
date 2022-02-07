import { dirname, join } from "path";
import { createIndexer, fileToAst } from "./indexer.mjs";

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
const ast = await fileToAst(file);

const result = await indexer
  .addGlob(file)
  .mapNodes("paragraph, list", function (data) {
    return data;
  })
  .generateIndexes();
console.log(result);
