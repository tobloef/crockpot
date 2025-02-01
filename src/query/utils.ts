import type { Direction, Edgelike, Nodelike, QueryInput, QueryInputItem } from "./query.types.ts";
import { type Class, isClassThatExtends } from "../utils/class.ts";
import { Node } from "../node.ts";
import { NodeQueryItem } from "../node-query-item.ts";
import { Edge } from "../edge.ts";
import { EdgeQueryItem } from "../edge-query-item.ts";

export function isSingleItem(input: QueryInput): input is QueryInputItem {
  return (
    !Array.isArray(input) &&
    input.constructor.name !== "Object"
  )
}

export function isNodelike(
  item: Nodelike | Edgelike,
): item is Nodelike {
  return (
    isClassThatExtends(item as Class<any>, Node) ||
    item instanceof Node ||
    item instanceof NodeQueryItem
  );
}

export function isEdgelike(
  item: Nodelike | Edgelike,
): item is Edgelike {
  return (
    isClassThatExtends(item as Class<any>, Edge) ||
    item instanceof Edge ||
    item instanceof EdgeQueryItem
  );
}

export function getOppositeDirection(direction: Direction): Direction {
  switch (direction) {
    case "from": return "to";
    case "to": return "from";
    case "fromOrTo": return "fromOrTo";
  }
}