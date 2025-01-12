import type { QueryInput, QueryInputItem, QueryOutput } from "./query.types.ts";
import type { Class } from "./utils/class.ts";
import { Node } from "./node.ts";
import { NodeQueryItem } from "./node-query-item.ts";
import { Edge } from "./edge.ts";
import { EdgeQueryItem } from "./edge-query-item.ts";
import { randomString } from "./utils/random-string.ts";

export function query<
  Input extends QueryInput
>(
  input: Input
): QueryOutput<Input> {
  const { nodeConstraints, edgeConstraints, outputs } = parseInput(input)


}

type NodeName = string;
type EdgeName = string;

type Outputs = Array<{
  type: "node" | "edge";
  name: string;
  key: number | string;
}>;

type NodeConstraints = Record<NodeName, NodeConstraint>;
type EdgeConstraints = Record<EdgeName, EdgeConstraint>;

type NodeConstraint = {
  class?: Class<Node>;
  edges?: EdgeName[];
}

type EdgeConstraint = {
  class?: Class<Edge>;
  direction?: "to" | "from";
  nodeA?: NodeName;
  nodeB?: NodeName;
}

type ParsedInput = {
  nodeConstraints: NodeConstraints;
  edgeConstraints: EdgeConstraints;
  outputs: Outputs;
}


type QueryGraphNode = {
  name: string;
  class?: Class<Node | Edge>;
  withItems?: string[];
  toItems?: string[];
  fromItems?: string[];
};

function parseInput(input: QueryInput): ParsedInput {
  const items = extractItems(input);

  // Graph of names
  let graph: NameNode[] = {};

  // Nodes by name
  let nodes: Record<string, QueryGraphNode> = {};

  for (const item of items) {
    const { node, subNodes } = parseItem(item);

    nodes[node.name] = node;


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
    return parseEdgeClass(item as Class<Edge>);
  } else if (item instanceof Edge) {
    return parseEdgeInstance(item);
  } else if (item instanceof EdgeQueryItem) {
    return parseEdgeQueryItem(item);
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
      class: item,
    },
  };
}

function parseNodeInstance(item: Node): ParseResult {
  return {
    node: {
      name: item.id,
      class: item.constructor as Class<Node>,
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
      class: item.type,
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
      class: item,
    },
  }
}

function parseEdgeInstance(item: Edge): ParseResult {
  return {
    node: {
      name: item.id,
      class: item.constructor as Class<Edge>,
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
      class: item.type,
      withItems,
      toItems,
      fromItems,
    },
    subNodes: allSubNodes,
  }
}
