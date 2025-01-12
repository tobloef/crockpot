import type { QueryInput, QueryInputItem, QueryOutput } from "./query.types.ts";
import { NotImplementedError } from "./utils/errors/not-implemented-error.ts";
import type { Class } from "./utils/class.ts";
import { Node } from "./node.ts";
import { NodeQueryItem } from "./node-query-item.ts";
import { Edge } from "./edge.ts";
import { EdgeQueryItem } from "./edge-query-item.ts";
import { Either } from "./either.ts";
import { randomString } from "./utils/random-string.ts";

export function query<
  Input extends QueryInput
>(
  input: Input
): QueryOutput<Input> {
  const queryGraph = parseInput(input)
}

type EitherQueryGraphNode = {
  possibilities: ParseResult[];
}

type QueryGraphNode = {
  name: string;
  type?: Class<Node | Edge>;
  withItems?: string[];
  toItems?: string[];
  fromItems?: string[];
} | EitherQueryGraphNode;

function parseInput(input: QueryInput) {
  const items = extractItems(input);

  let queryGraph = {};

  for (const item of items) {
    const queryGraphNode = parseItem(item);
  }
}

function extractItems(input: QueryInput): QueryInputItem[] {
  if (Array.isArray(input)) {
    return input;
  } else if (input.constructor.name === "Object") {
    return Object.values(input);
  } else {
    return [input as QueryInputItem];
  }
}

type ParseResult = {
  node: QueryGraphNode;
  subNodes?: QueryGraphNode[];
}

function parseItem(item: QueryInputItem): ParseResult {
  if (isClassThatExtends(item as Class<any>, Node)) {
    return parseNodeClass(item as Class<Node>);
  } else if (item instanceof Node) {
    return parseNodeInstance(item);
  } else if (item instanceof NodeQueryItem) {
    return parseNodeQueryItem(item);
  } else if (typeof item === "string") {
    return parseString(item);
  } else if (isClassThatExtends(item as Class<any>, Edge)) {
    return parseEdgeClass(item);
  } else if (item instanceof Edge) {
    return parseEdgeInstance(item);
  } else if (item instanceof EdgeQueryItem) {
    return parseEdgeQueryItem(item);
  } else if (item instanceof Either) {
    return parseEither(item);
  } else {
    throw new Error(`Invalid query item ${item}`);
  }
}

function isClassThatExtends(child: Class<any>, parent: Class<any>) {
  return (
    child === parent ||
    (parent.prototype?.isPrototypeOf(child.prototype) ?? false)
  );
}

function parseNodeClass(item: Class<Node>): ParseResult {
  return {
    node: {
      name: randomString(),
      type: item,
    },
  };
}

function parseNodeInstance(item: Node): ParseResult {
  return {
    node: {
      name: item.id,
      type: item.constructor as Class<Node>,
    },
  }
}

function parseNodeQueryItem(
  item: NodeQueryItem
): ParseResult {
  const allSubNodes: QueryGraphNode[] = [];

  const withItems: string[] = [];
  const toItems: string[] = [];
  const fromItems: string[] = [];

  for (const value of item.withItems ?? []) {
    const { node, subNodes } = parseItem(value);
    withItems.push(node.name);
    allSubNodes.push(node, ...subNodes ?? []);
  }

  for (const value of item.toItems ?? []) {
    const { node, subNodes } = parseItem(value);
    toItems.push(node.name);
    allSubNodes.push(node, ...subNodes ?? []);
  }

  for (const value of item.fromItems ?? []) {
    const { node, subNodes } = parseItem(value);
    fromItems.push(node.name);
    allSubNodes.push(node, ...subNodes ?? []);
  }

  return {
    node: {
      name: item.name ?? randomString(),
      type: item.type,
      withItems,
      toItems,
      fromItems,
    },
    subNodes: allSubNodes,
  }
}

function parseString(item: string): ParseResult {
  return {
    node: {
      name: item,
    },
  }
}

function parseEdgeClass(item: Class<Edge>): ParseResult {
  return {
    node: {
      name: randomString(),
      type: item,
    },
  }
}

function parseEdgeInstance(item: Edge): ParseResult {
  return {
    node: {
      name: item.id,
      type: item.constructor as Class<Edge>,
    },
  }
}

function parseEdgeQueryItem(
  item: EdgeQueryItem
): ParseResult {
  const allSubNodes: QueryGraphNode[] = [];

  const withItems: string[] = [];
  const toItems: string[] = [];
  const fromItems: string[] = [];

  for (const value of item.withItems ?? []) {
    const { node, subNodes } = parseItem(value);
    withItems.push(node.name);
    allSubNodes.push(node, ...subNodes ?? []);
  }

  for (const value of item.toItems ?? []) {
    const { node, subNodes } = parseItem(value);
    toItems.push(node.name);
    allSubNodes.push(node, ...subNodes ?? []);
  }

  for (const value of item.fromItems ?? []) {
    const { node, subNodes } = parseItem(value);
    fromItems.push(node.name);
    allSubNodes.push(node, ...subNodes ?? []);
  }

  return {
    node: {
      name: item.name ?? randomString(),
      type: item.type,
      withItems,
      toItems,
      fromItems,
    },
    subNodes: allSubNodes,
  }
}

function parseEither(
  item: Either<QueryInputItem[]>
): ParseResult {
  return {
    node: {
      items,
    },

  }
}