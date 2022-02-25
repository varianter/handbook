import { visit } from "unist-util-visit";
import { selectAll, select } from "unist-util-select";

import { evaluate } from "estree-eval";

export function getTextValue(node) {
  let str = "";
  visit(node, "text", function (item) {
    str += " " + item.value;
  });
  return str.trim();
}

export function selectAttribute(selector, node) {
  const nodeWithAttrs = { children: node.attributes };
  return select(selector, nodeWithAttrs);
}

export function selectAttributeValue(selector, node) {
  const nodeWithAttrs = { children: node.attributes };
  const result = select(selector, nodeWithAttrs);
  if (!result) {
    return undefined;
  }
  if (result.value && result.value.type == "mdxJsxAttributeValueExpression") {
    const actualNode = result.value.data.estree.body[0];
    if (!actualNode.expression) {
      return undefined;
    }
    return evaluate(actualNode.expression);
  }
  return result.value;
}

export function selectAllAttributes(selector, node) {
  const nodeWithAttrs = { children: node.attributes };
  return selectAll(selector, nodeWithAttrs);
}
