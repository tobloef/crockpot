import type { QueryInput, QueryInputItem, QueryOutput, QueryOutputItem } from "./query.types.ts";
import type { Class, Instance } from "./utils/class.ts";
import { Node } from "./node.ts";
import { NodeQueryItem } from "./node-query-item.ts";
import { Edge } from "./edge.ts";
import { EdgeQueryItem } from "./edge-query-item.ts";
import { randomString } from "./utils/random-string.ts";
import type { Graph } from "./graph.ts";
import type { Constraints } from "../v2/query/pools.ts";

export function* query<
  Input extends QueryInput
>(
  graph: Graph,
  input: Input,
): Generator<QueryOutput<Input>> {
  const {
    poolNames,
    poolConstraints,
    poolNameToOutputKeyMap,
  } = parseInput(input)

  // Here there are many heuristics that we could apply,
  // in order to find out which node to start resolving first.
  // Some nodes can utilize better indexes than others.
  // In `[A.with("n"), B.with("n")]`, for example, you could
  // the best option would be to start with "n", as it could
  // have an archetype index on [A, B].

  // But for now, we'll just brute force it completely, by
  // iterating through all permutations of nodes/edges until
  // we find a match that satisfies all constraints.

  const pools = createPools(graph, poolNames);
  const permutations = permutePools(pools);

  let foundOutputs: QueryOutput<Input>[] = [];

  for (const permutation of permutations) {
    const isMatch = checkPermutationConstraints(graph, permutation, poolConstraints);

    if (!isMatch) {
      continue;
    }

    const output = mapOutput<Input>(input, permutation, poolNameToOutputKeyMap);

    const wasAlreadyFound = checkIfAlreadyFound<Input>(foundOutputs, output);

    if (wasAlreadyFound) {
      continue;
    }

    foundOutputs.push(output);

    yield output;
  }
}

function isSingleItem(input: QueryInput): boolean {
  return (
    !Array.isArray(input) &&
    input.constructor.name !== "Object"
  )
}

function checkIfAlreadyFound<
  Input extends QueryInput
>(
  foundOutputs: QueryOutput<Input>[],
  output: QueryOutput<Input>,
): boolean {
  const isOutputSingleItem = isSingleItem(output);

  for (const foundOutput of foundOutputs) {
    if (isOutputSingleItem) {
      if (foundOutput === output) {
        return true;
      } else {
        continue;
      }
    }

    const outputEntries = Object.entries(output);
    const foundEntries = Object.entries(foundOutput);

    if (foundEntries.length !== outputEntries.length) {
      continue;
    }

    let wasMatch = true;

    for (let i = 0; i < foundEntries.length; i++) {
      const [foundKey, foundValue] = foundEntries[i];
      const [outputKey, outputValue] = outputEntries[i];

      if (foundKey !== outputKey) {
        wasMatch = false;
        break;
      }

      if (foundValue !== outputValue) {
        wasMatch = false;
        break;
      }
    }

    if (wasMatch) {
      return true;
    }
  }

  return false;
}

function checkPermutationConstraints(
  graph: Graph,
  permutation: Record<string, Node | Edge>,
  constraints: PoolConstraints,
): boolean {
  const entries = Object.entries(permutation);

  for (const [poolName, item] of entries) {
    const isMatch = checkItemConstraints(
      graph,
      permutation,
      constraints,
      poolName,
      item,
    );

    if (!isMatch) {
      return false;
    }
  }

  return true;
}

function checkItemConstraints(
  graph: Graph,
  permutation: Record<string, Node | Edge>,
  poolConstraints: PoolConstraints,
  poolName: string,
  item: Node | Edge,
): boolean {
  const itemConstraints = poolConstraints[poolName];

  if (itemConstraints === undefined) {
    return true;
  }

  if (
    itemConstraints.instance !== undefined &&
    item !== itemConstraints.instance
  ) {
    return false;
  }

  if (
    itemConstraints.class !== undefined &&
    !(item instanceof itemConstraints.class)
  ) {
    return false;
  }

  if (item instanceof Edge) {
    const edgeConstraints = itemConstraints as EdgeConstraints;

    const nodeA = edgeConstraints.nodeA
      ? permutation[edgeConstraints.nodeA]
      : undefined;

    const nodeB = edgeConstraints.nodeB
      ? permutation[edgeConstraints.nodeB]
      : undefined;

    const edgeNodes = graph.edgeToNodes.get(item);

    const fromNode = edgeNodes?.from;
    const toNode = edgeNodes?.to;

    const isAToB = nodeA === fromNode && nodeB === toNode;
    const isBToA = nodeA === toNode && nodeB === fromNode;

    if (edgeConstraints.direction === "to") {
      if (!isAToB) {
        return false;
      }
    } else if (edgeConstraints.direction === "from") {
      if (!isBToA) {
        return false;
      }
    } else {
      if (!isAToB && !isBToA) {
        return false;
      }
    }
  } else {
    // Nothing specific right now
  }

  return true;
}

function mapOutput<
  Input extends QueryInput
>(
  input: QueryInput,
  permutation: Record<string, Node | Edge>,
  poolNameToOutputKeyMap: Record<string, string>,
): QueryOutput<Input> {
  if (isSingleItem(input)) {
    const firstKey = Object.keys(poolNameToOutputKeyMap)[0];
    return permutation[firstKey] as QueryOutput<Input>;
  }

  const output = Array.isArray(input) ? [] : {};

  const isArray = Array.isArray(input);

  for (const [poolName, outputKey] of Object.entries(poolNameToOutputKeyMap)) {
    const key = isArray ? Number(outputKey) : outputKey;
    (output as any)[key] = permutation[poolName];
  }

  return output as QueryOutput<Input>;
}

export function* permutePools(
  pools: Record<string, Pool>
): Generator<Record<string, Node | Edge>> {
  if (Object.keys(pools).length === 0) {
    return;
  }

  const poolKeys = Object.keys(pools);
  const firstKey = poolKeys[0];
  const firstPool = pools[firstKey];
  const otherPools = Object.fromEntries(
    poolKeys.slice(1).map((key) => [key, pools[key]]),
  );

  for (const entity of firstPool.createIterator()) {
    if (Object.keys(otherPools).length === 0) {
      const permutation = { [firstKey]: entity };
      yield permutation;
    } else {
      const otherPermutations = permutePools(otherPools);

      for (const otherPermutation of otherPermutations) {
        const permutation = { [firstKey]: entity, ...otherPermutation };
        yield permutation;
      }
    }
  }
}

type Pool = {
  createIterator: () => Generator<Node | Edge>;
}

function createPools(
  graph: Graph,
  poolNames: string[]
): Record<string, Pool> {
  const pools: Record<string, Pool> = {};

  for (const name of poolNames) {
    pools[name] = createPool(graph);
  }

  return pools;
}

function createPool(
  graph: Graph,
): Pool {
  return {
    createIterator: () => combineGenerators<Node | Edge>(
      arrayToGenerator(graph.nodes),
      arrayToGenerator(graph.edges),
    )
  }
}

export function* arrayToGenerator<T>(array: T[]): Generator<T> {
  for (const item of array) {
    yield item;
  }
}

export function* combineGenerators<T>(
  ...generators: Generator<T>[]
): Generator<T> {
  for (const generator of generators) {
    for (const item of generator) {
      yield item;
    }
  }
}

type PoolName = string;
type ItemConstraints = NodeConstraints | EdgeConstraints;
type PoolConstraints = Record<PoolName, ItemConstraints>;

type NodeConstraints = {
  class?: Class<Node>;
  instance?: Node;
}

type EdgeConstraints = {
  class?: Class<Edge>;
  instance?: Edge;
  direction?: "to" | "from";
  nodeA?: PoolName;
  nodeB?: PoolName;
}

type ParsedInput = {
  poolNames: PoolName[];
  poolConstraints: PoolConstraints;
  poolNameToOutputKeyMap: Record<PoolName, string>;
}

type ParsedItem = {
  poolName: string;
  constraints?: PoolConstraints;
  subItems?: ParsedItem[];
}

type QueryInputItemEntry = [
  string,
  QueryInputItem
];

function parseInput(input: QueryInput): ParsedInput {
  const poolNames: string[] = [];
  const poolConstraints: PoolConstraints = {};
  const poolNameToOutputKeyMap: Record<string, string> = {};

  const entries: QueryInputItemEntry[] = isSingleItem(input)
    ? Object.entries([input])
    : Object.entries(input);

  for (const [key, item] of entries) {
    // TODO
  }

  return {
    poolNames,
    poolConstraints,
    poolNameToOutputKeyMap,
  }
}

function parseItem(item: QueryInputItem): ParsedItem {
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

function parseNodeClass(item: Class<Node>): ParsedItem {
  const poolName = randomString();

  const nodeConstraints: NodeConstraints = {
    class: item,
  };

  return {
    poolName,
    constraints: {
      [poolName]: nodeConstraints
    }
  };
}

function parseNodeInstance(item: Node): ParsedItem {
  const poolName = item.id;

  const nodeConstraints: NodeConstraints = {
    instance: item,
  };

  return {
    poolName,
    constraints: {
      [poolName]: nodeConstraints
    }
  };
}

function parseNodeQueryItem(
  item: NodeQueryItem
): ParsedItem {
  const poolName = item.name ?? randomString();
  const constraints: PoolConstraints = {};
  const subItems: ParsedItem[] = [];

  constraints[poolName] = {
    class: item.class,
  }

  for (const subItem of item.withItems ?? []) {
    const parsedSubItem = parseItem(subItem);
    subItems.push(parsedSubItem);


  }

  return {
    poolName,
    constraints,
    subItems,
  }



  const allSubNodes: QueryGraphNode[] = [];

  const withItems: string[] = [];
  const toItems: string[] = [];
  const fromItems: string[] = [];

  for (const value of item.withItems ?? []) {
    const { node, subNodes } = parseItem(value);
    withItems.push(node.poolName);
    allSubNodes.push(node, ...subNodes ?? []);
  }

  for (const value of item.toItems ?? []) {
    const { node, subNodes } = parseItem(value);
    toItems.push(node.poolName);
    allSubNodes.push(node, ...subNodes ?? []);
  }

  for (const value of item.fromItems ?? []) {
    const { node, subNodes } = parseItem(value);
    fromItems.push(node.poolName);
    allSubNodes.push(node, ...subNodes ?? []);
  }

  return {
    node: {
      poolName: item.name ?? randomString(),
      class: item.class,
      withItems,
      toItems,
      fromItems,
    },
    subNodes: allSubNodes,
  }
}

function parseString(item: string): ParsedItem {
  return {
    node: {
      poolName: item,
    },
  }
}

function parseEdgeClass(item: Class<Edge>): ParsedItem {
  return {
    node: {
      poolName: randomString(),
      class: item,
    },
  }
}

function parseEdgeInstance(item: Edge): ParsedItem {
  return {
    node: {
      poolName: item.id,
      class: item.constructor as Class<Edge>,
    },
  }
}

function parseEdgeQueryItem(
  item: EdgeQueryItem
): ParsedItem {
  const allSubNodes: QueryGraphNode[] = [];

  const withItems: string[] = [];
  const toItems: string[] = [];
  const fromItems: string[] = [];

  for (const value of item.withItems ?? []) {
    const { node, subNodes } = parseItem(value);
    withItems.push(node.poolName);
    allSubNodes.push(node, ...subNodes ?? []);
  }

  for (const value of item.toItems ?? []) {
    const { node, subNodes } = parseItem(value);
    toItems.push(node.poolName);
    allSubNodes.push(node, ...subNodes ?? []);
  }

  for (const value of item.fromItems ?? []) {
    const { node, subNodes } = parseItem(value);
    fromItems.push(node.poolName);
    allSubNodes.push(node, ...subNodes ?? []);
  }

  return {
    node: {
      poolName: item.name ?? randomString(),
      class: item.class,
      withItems,
      toItems,
      fromItems,
    },
    subNodes: allSubNodes,
  }
}

function isClassThatExtends(child: Class<any>, parent: Class<any>) {
  return (
    child === parent ||
    (parent.prototype?.isPrototypeOf(child.prototype) ?? false)
  );
}