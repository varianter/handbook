import { dirname, join } from "path";
import { createIndexer } from "./indexer.mjs";
import { selectAttributeValue } from "./tree-tools.mjs";
import algoliasearch from "algoliasearch";
import dotenv from "dotenv";

if (!process.env.NODE_ENV) {
  dotenv.config({ path: ".env.local" });
}

const baseUrl = process.env.BASE_URL || "";
const appId = process.env.ALGOLIA_APP_ID || "";
const apiKey = process.env.ALGOLIA_API_KEY || "";
if (process.env.NODE_ENV === "production" && baseUrl === "") {
  throw new Error("Please set the BASE_URL environment variable");
}
if (appId === "") {
  throw new Error("Please set the ALGOLIA_APP_ID environment variable");
}
if (apiKey === "") {
  throw new Error("Please set the ALGOLIA_API_KEY environment variable");
}

const departments = ["Trondheim", "Oslo", "Bergen", "Molde"];

import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const systemId = "handbook";

function allIfAll(deps) {
  if (deps.includes("all")) {
    return departments;
  }
  return deps;
}

const indexer = createIndexer({ baseUrl, systemId });
// const file = join(__dirname, "../pages/test.mdx");
const file = join(__dirname, "../pages/**/*.{md,mdx}");
const result = await indexer
  .addGlob(file)
  .addNodeMap("mdxJsxFlowElement[name=DepartmentItem]", function (data, node) {
    const val = selectAttributeValue("[name=dep]", node);
    const department = Array.isArray(val) ? val : [val];
    return {
      ...data,
      // Mark all items in the department as "all" to filter
      department: allIfAll(department),
    };
  })
  .addNodeMap("paragraph", function (data, node) {
    return {
      ...data,
      department: departments,
    };
  })
  .generateIndexes();

const client = algoliasearch(appId, apiKey);
const index = client.initIndex("handbook_content");
await index.setSettings({
  attributesForFaceting: ["systemId", "department"],
});
await index.deleteBy({
  filters: `systemId:${systemId}`,
});

try {
  const returned = await index.saveObjects(result, {
    autoGenerateObjectIDIfNotExist: true,
  });
  console.log(`Indexed ${returned.objectIDs.length} items`);
} catch (e) {
  console.log(e);
}
