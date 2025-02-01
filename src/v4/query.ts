import type { Edgelike, Nodelike, QueryInput, QueryInputItem, QueryOutput, ReferenceName, } from "./query.types.ts";
import type { Class } from "./utils/class.ts";
import { Node } from "./node.ts";
import { NodeQueryItem } from "./node-query-item.ts";
import { Edge } from "./edge.ts";
import { EdgeQueryItem } from "./edge-query-item.ts";
import { randomString } from "./utils/random-string.ts";
import type { Graph } from "./graph.ts";
import { CustomError } from "./utils/errors/custom-error.ts";

export function* query<
  Input extends QueryInput
>(
  graph: Graph,
  input: Input,
): Generator<QueryOutput<Input>> {
  const pools = parseInput(input);
  const generators = createGeneratorFunctions(graph, pools);
  const permutations = permuteGenerators(generators);

  const foundOutputs: QueryOutput<Input>[] = [];

  for (const permutation of permutations) {
    const passesConstraints = checkConstraints(permutation, pools);

    if (!passesConstraints) {
      continue;
    }

    const output = permutationToOutput(permutation, pools, input);

    const wasAlreadyFound = checkIfAlreadyFound(output, foundOutputs);

    if (wasAlreadyFound) {
      continue;
    }

    foundOutputs.push(output);

    yield output;
  }
}

function parseInput(
  input: QueryInput,
): Pools {
  const pools: Pools = {
    nodes: {},
    edges: {},
    unknown: {},
  };

  if (isSingleItem(input)) {
    parseItem(input, pools);
  } else if (Array.isArray(input)) {
    for (let i = 0; i < input.length; i++) {
      const item = input[i]!;
      const poolName = parseItem(item, pools);
      const pool = getAnyPool(poolName, pools)!;
      pool.outputKey = i;
    }
  } else {
    const entries = Object.entries(input);
    for (const [key, item] of entries) {
      const poolName = parseItem(item, pools);
      const pool = getAnyPool(poolName, pools)!;
      pool.outputKey = key;
    }
  }

  return pools;
}

function getAnyPool(
  poolName: PoolName,
  pools: Pools
) {
  return (
    pools.nodes[poolName] ??
    pools.edges[poolName] ??
    pools.unknown[poolName]
  );
}

type PoolName = string;

type Direction = "from"  | "to" | "fromOrTo";

function getOppositeDirection(direction: Direction): Direction {
  switch (direction) {
    case "from": return "to";
    case "to": return "from";
    case "fromOrTo": return "fromOrTo";
  }
}

type Pools = {
  nodes: Record<PoolName, NodePool>,
  edges: Record<PoolName, EdgePool>,
  unknown: Record<PoolName, NodePool & EdgePool>
}

type NodePool = {
  constraints: {
    instance?: Node,
    class?: Class<Node>,
    edges?: {
      // "from" means that the edge is going from this node
      from?: PoolName[],
      to?: PoolName[],
      fromOrTo?: PoolName[],
    },
  },
  outputKey?: string | number,
}

type EdgePool = {
  constraints: {
    instance?: Edge,
    class?: Class<Edge>,
    nodes?: {
      to?: PoolName,
      from?: PoolName,
      toOrFrom?: PoolName[],
    }
  },
  outputKey?: string | number,
}

function parseItem(
  item: Nodelike | Edgelike,
  pools: Pools,
): PoolName {
  if (typeof item === "string") {
    return parseReferenceName(item, pools);
  }

  return isNodelike(item)
    ? parseNode(item, pools)
    : parseEdge(item, pools);
}

function isNodelike(
  item: Nodelike | Edgelike,
): item is Nodelike {
  return (
    isClassThatExtends(item as Class<any>, Node) ||
    item instanceof Node ||
    item instanceof NodeQueryItem
  );
}

function isEdgelike(
  item: Nodelike | Edgelike,
): item is Edgelike {
  return (
    isClassThatExtends(item as Class<any>, Edge) ||
    item instanceof Edge ||
    item instanceof EdgeQueryItem
  );
}

function parseReferenceName(
  item: ReferenceName,
  pools: Pools,
  parent?: {
    type: "edge" | "node",
    poolName: PoolName,
    direction: Direction
  }
): PoolName {
  const poolName = item;

  const existingNodePool = pools.nodes[poolName];
  const existingEdgePool = pools.edges[poolName];
  const existingUnknownPool = pools.unknown[poolName];

  const existingType = (
    existingNodePool ? "node" :
      existingEdgePool ? "edge" :
        existingUnknownPool ? "unknown" :
          undefined
  );

  const thisType = (
    parent?.type === "edge" ? "node" :
      parent?.type === "node" ? "edge" :
        "unknown"
  );

  if (existingType === "node" && thisType === "edge") {
    throw new ReferenceMismatchError(poolName, { existing: existingType, new: thisType });
  } else if (existingType === "edge" && thisType === "node") {
    throw new ReferenceMismatchError(poolName, { existing: existingType, new: thisType });
  } else if (existingType === undefined && thisType === "node") {
    pools.nodes[poolName] = { constraints: {} };
  } else if (existingType === undefined && thisType === "edge") {
    pools.edges[poolName] = { constraints: {} };
  } else if (existingType === undefined && thisType === "unknown") {
    pools.unknown[poolName] = { constraints: {} };
  } else if (existingType === "unknown" && thisType === "node") {
    pools.nodes[poolName] = { constraints: {} };
    delete pools.unknown[poolName];
  } else if (existingType === "unknown" && thisType === "edge") {
    pools.edges[poolName] = { constraints: {} };
    delete pools.unknown[poolName];
  }

  return poolName;
}

export class ReferenceMismatchError extends CustomError {
  poolName: PoolName;

  types: (
    | { existing: "node", new: "edge" }
    | { existing: "edge", new: "node" }
    );

  constructor(
    poolName: PoolName,
    types: (
      | { existing: "node", new: "edge" }
      | { existing: "edge", new: "node" }
    )
  ) {
    super(`Reference ${poolName} is already defined as a ${types.existing}, cannot redefine as a ${types.new}.`);
    this.types = types;
    this.poolName = poolName;
  }
}

function parseNode(
  item: Nodelike,
  pools: Pools,
  parentEdge?: {
    poolName: PoolName,
    // "to" means that the parent edge is going to this node
    direction: Direction,
  }
): PoolName {
  let poolName: PoolName;

  if (typeof item === "string") {
    poolName = parseReferenceName(
      item,
      pools,
      parentEdge ? { type: "edge", ...parentEdge } : undefined
    );
  } else if (item instanceof Node) {
    poolName = parseNodeInstance(item, pools);
  } else if (item instanceof NodeQueryItem) {
    poolName = parseNodeQueryItem(item, pools);
  } else {
    poolName = parseNodeClass(item, pools);
  }

  if (parentEdge !== undefined) {
    const edgePool = pools.edges[parentEdge.poolName]!;
    edgePool.constraints.nodes ??= {};
    if (parentEdge.direction === "fromOrTo") {
      if (edgePool.constraints.nodes.toOrFrom?.length === 2) {
        throw new Error(`Edge ${parentEdge.poolName} already has both nodes defined.`);
      }

      edgePool.constraints.nodes.toOrFrom ??= [];
      edgePool.constraints.nodes.toOrFrom.push(poolName);
    } else {
      edgePool.constraints.nodes[parentEdge.direction] = poolName;
    }

    const nodePool = pools.nodes[poolName]!;
    nodePool.constraints.edges ??= {};
    nodePool.constraints.edges[parentEdge.direction] ??= [];
    nodePool.constraints.edges[parentEdge.direction]?.push(parentEdge.poolName);
  }

  return poolName;
}

function parseNodeClass(item: Class<Node>, pools: Pools): PoolName {
  const poolName = randomString();

  pools.nodes[poolName] = {
    constraints: {
      class: item,
    }
  };

  return poolName;
}

function parseNodeInstance(item: Node, pools: Pools): PoolName {
  const poolName = item.id;

  pools.nodes[poolName] = {
    constraints: {
      instance: item,
    }
  };

  return poolName;
}

function parseNodeQueryItem(item: NodeQueryItem, pools: Pools): PoolName {
  const poolName = item.name ?? randomString();

  const existingPool = pools.nodes[poolName];

  if (existingPool !== undefined) {
    const existingClass = existingPool.constraints.class;

    if (existingClass !== undefined && existingClass !== item.class) {
      if (isClassThatExtends(item.class, existingClass)) {
        existingPool.constraints.class = item.class;
      } else if (isClassThatExtends(existingClass, item.class)) {
        // Do nothing
      } else {
        throw new Error(`Node class mismatch for ${poolName}: ${existingClass} and ${item.class}`);
      }
    }
  }

  pools.nodes[poolName] ??= {
    constraints: {
      class: item.class,
    }
  };

  for (const withItem of item.withItems ?? []) {
    parseEdge(withItem, pools, { poolName, direction: "fromOrTo" });
  }

  for (const toItem of item.toItems ?? []) {
    const edgePoolName = randomString();

    pools.edges[edgePoolName] = {
      constraints: {
        nodes: {
          from: poolName,
        }
      },
    };

    pools.nodes[poolName].constraints.edges ??= {};
    pools.nodes[poolName].constraints.edges.from ??= [];
    pools.nodes[poolName].constraints.edges.from.push(edgePoolName);

    parseNode(toItem, pools, { poolName: edgePoolName, direction: "to" });
  }

  for (const fromItem of item.fromItems ?? []) {
    const edgePoolName = randomString();

    pools.edges[edgePoolName] = {
      constraints: {
        nodes: {
          to: poolName,
        }
      },
    };

    pools.nodes[poolName].constraints.edges ??= {};
    pools.nodes[poolName].constraints.edges.to ??= [];
    pools.nodes[poolName].constraints.edges.to.push(edgePoolName);

    parseNode(fromItem, pools, { poolName: edgePoolName, direction: "from" });
  }

  return poolName;
}

function parseEdge(
  item: Edgelike,
  pools: Pools,
  parentNode?: {
    poolName: PoolName,
    direction: Direction,
  },
): PoolName {
  let poolName: PoolName;

  if (typeof item === "string") {
    poolName = parseReferenceName(
      item,
      pools,
      parentNode ? { type: "node", ...parentNode } : undefined
    );
  } else if (item instanceof Edge) {
    poolName = parseEdgeInstance(item, pools);
  } else if (item instanceof EdgeQueryItem) {
    poolName = parseEdgeQueryItem(item, pools);
  } else {
    poolName = parseEdgeClass(item, pools);
  }

  if (parentNode !== undefined) {
    const nodePool = pools.nodes[parentNode.poolName]!;
    nodePool.constraints.edges ??= {};
    nodePool.constraints.edges[parentNode.direction] ??= [];
    nodePool.constraints.edges[parentNode.direction]?.push(poolName);

    const edgePool = pools.edges[poolName]!;
    if (parentNode.direction === "fromOrTo") {
      if (edgePool.constraints.nodes?.toOrFrom?.length === 2) {
        throw new Error(`Edge ${poolName} already has both nodes defined.`);
      }

      edgePool.constraints.nodes ??= {};
      edgePool.constraints.nodes.toOrFrom ??= [];
      edgePool.constraints.nodes.toOrFrom.push(parentNode.poolName);
    } else {
      edgePool.constraints.nodes ??= {};
      edgePool.constraints.nodes[parentNode.direction] = parentNode.poolName;
    }
  }

  return poolName;
}

function parseEdgeClass(item: Class<Edge>, pools: Pools): PoolName {
  const poolName = randomString();

  pools.edges[poolName] = {
    constraints: {
      class: item,
    }
  };

  return poolName;
}

function parseEdgeInstance(item: Edge, pools: Pools): PoolName {
  const poolName = item.id;

  pools.edges[poolName] = {
    constraints: {
      instance: item,
    }
  };

  return poolName;
}

function parseEdgeQueryItem(item: EdgeQueryItem, pools: Pools): PoolName {
  const poolName = item.name ?? randomString();

  const existingPool = pools.edges[poolName];

  if (existingPool !== undefined) {
    const existingClass = existingPool.constraints.class;

    if (existingClass !== undefined && existingClass !== item.class) {
      if (isClassThatExtends(item.class, existingClass)) {
        existingPool.constraints.class = item.class;
      } else if (isClassThatExtends(existingClass, item.class)) {
        // Do nothing
      } else {
        throw new Error(`Edge class mismatch for ${poolName}: ${existingClass} and ${item.class}`);
      }
    }
  }

  pools.edges[poolName] = {
    constraints: {
      class: item.class,
    }
  };

  if (item.toItem !== undefined) {
    parseNode(item.toItem, pools, { poolName, direction: "to" });
  }

  if (item.fromItem !== undefined) {
    parseNode(item.fromItem, pools, { poolName, direction: "from" });
  }

  if (item.fromOrToItems !== undefined) {
    for (const fromOrToItem of item.fromOrToItems) {
      parseNode(fromOrToItem, pools, { poolName, direction: "fromOrTo" });
    }
  }

  return poolName;
}

type GeneratorFunction<T> = () => Generator<T>;

type GeneratorFunctions = Record<PoolName, GeneratorFunction<any>>;
type PermutationFromGeneratorFunctions<Generators extends GeneratorFunctions> = {
  [Key in keyof Generators]: (
    Generators[Key] extends GeneratorFunction<infer T> ? T : never
    )
}

function createGeneratorFunctions(
  graph: Graph,
  pools: Pools,
): Record<PoolName, GeneratorFunction<Node | Edge>> {
  const generatorFunctions: Record<PoolName, GeneratorFunction<Node | Edge>> = {};

  const nodeGeneratorFunction = () => arrayToGenerator(graph.nodes);
  const edgeGeneratorFunction = () => arrayToGenerator(graph.edges);

  for (const poolName of Object.keys(pools.nodes)) {
    generatorFunctions[poolName] = nodeGeneratorFunction;
  }

  for (const poolName of Object.keys(pools.edges)) {
    generatorFunctions[poolName] = edgeGeneratorFunction;
  }

  return generatorFunctions;
}

function* permuteGenerators<
  GenFuncs extends GeneratorFunctions
>(
  generatorFunctions: GenFuncs,
): Generator<PermutationFromGeneratorFunctions<GenFuncs>> {
  const entries = Object.entries(generatorFunctions);
  const [firstEntry, ...otherEntries] = entries;

  if (firstEntry === undefined) {
    return;
  }

  const [firstKey, firstGeneratorFunction] = firstEntry;
  const otherGeneratorFunctions = Object.fromEntries(otherEntries);

  for (const item of firstGeneratorFunction()) {
    if (otherEntries.length === 0) {
      const permutation = { [firstKey]: item };
      yield permutation as PermutationFromGeneratorFunctions<GenFuncs>;
    } else {
      const otherPermutations = permuteGenerators(otherGeneratorFunctions);

      for (const otherPermutation of otherPermutations) {
        const permutation = { [firstKey]: item, ...otherPermutation };
        yield permutation as PermutationFromGeneratorFunctions<GenFuncs>;
      }
    }
  }
}

function permutationToOutput<
  Input extends QueryInput
>(
  permutation: Record<string, Node | Edge>,
  pools: Pools,
  input: Input,
): QueryOutput<Input> {
  if (isSingleItem(input)) {
    const onlyPoolName = (
      Object.keys(pools.nodes)[0]! ??
      Object.keys(pools.edges)[0]!
    );

    return permutation[onlyPoolName] as QueryOutput<Input>;
  } else if (Array.isArray(input)) {
    const output = [];

    const allPools = { ...pools.nodes, ...pools.edges };

    for (const [poolName, pool] of Object.entries(allPools)) {
      if (pool.outputKey === undefined) {
        continue;
      }

      const item = permutation[poolName];

      output[pool.outputKey as number] = item;
    }

    return output as QueryOutput<Input>;
  } else {
    const output: Record<string, Node | Edge | undefined> = {};

    const allPools = { ...pools.nodes, ...pools.edges };

    for (const [poolName, pool] of Object.entries(allPools)) {
      if (pool.outputKey === undefined) {
        continue;
      }

      const item = permutation[poolName];

      output[pool.outputKey as string] = item;
    }

    return output as QueryOutput<Input>;
  }
}

function checkConstraints(
  permutation: Record<string, Node | Edge>,
  pools: Pools,
): boolean {
  for (const [poolName, item] of Object.entries(permutation)) {
    if (item instanceof Node) {
      const passesConstraints = checkNodeConstraints(
        item,
        poolName,
        permutation,
        pools,
      );

      if (!passesConstraints) {
        return false;
      }
    } else {
      const passesConstraints = checkEdgeConstraints(
        item,
        poolName,
        permutation,
        pools,
      );

      if (!passesConstraints) {
        return false;
      }
    }
  }

  return true;
}

function checkNodeConstraints(
  node: Node,
  poolName: PoolName,
  permutation: Record<string, Node | Edge>,
  pools: Pools,
): boolean {
  const pool = pools.nodes[poolName];

  if (pool === undefined) {
    return false;
  }

  if (pool.constraints.instance !== undefined) {
    if (pool.constraints.instance !== node) {
      return false;
    }
  }

  if (pool.constraints.class !== undefined) {
    if (!(node instanceof pool.constraints.class)) {
      return false;
    }
  }

  if (pool.constraints.edges?.from !== undefined) {
    for (const edgePoolName of pool.constraints.edges.from) {
      const edge = permutation[edgePoolName];

      if (!(edge instanceof Edge)) {
        return false;
      }

      if (!node.edges.from.includes(edge)) {
        return false;
      }
    }
  }

  if (pool.constraints.edges?.to !== undefined) {
    for (const edgePoolName of pool.constraints.edges.to) {
      const edge = permutation[edgePoolName];

      if (!(edge instanceof Edge)) {
        return false;
      }

      if (!node.edges.to.includes(edge)) {
        return false;
      }
    }
  }

  if (pool.constraints.edges?.fromOrTo !== undefined) {
    for (const edgePoolName of pool.constraints.edges.fromOrTo) {
      const edge = permutation[edgePoolName];

      if (!(edge instanceof Edge)) {
        return false;
      }

      if (!node.edges.from.includes(edge) && !node.edges.to.includes(edge)) {
        return false;
      }
    }
  }

  return true;
}

function checkEdgeConstraints(
  edge: Edge,
  poolName: PoolName,
  permutation: Record<string, Node | Edge>,
  pools: Pools,
): boolean {
  const pool = pools.edges[poolName];

  if (pool === undefined) {
    return false;
  }

  if (pool.constraints.instance !== undefined) {
    if (pool.constraints.instance !== edge) {
      return false;
    }
  }

  if (pool.constraints.class !== undefined) {
    if (!(edge instanceof pool.constraints.class)) {
      return false;
    }
  }

  if (pool.constraints.nodes?.from !== undefined) {
    const fromNode = permutation[pool.constraints.nodes.from];

    if (!(fromNode instanceof Node)) {
      return false;
    }

    if (edge.nodes.from !== fromNode) {
      return false;
    }
  }

  if (pool.constraints.nodes?.to !== undefined) {
    const toNode = permutation[pool.constraints.nodes.to];

    if (!(toNode instanceof Node)) {
      return false;
    }

    if (edge.nodes.to !== toNode) {
      return false;
    }
  }

  if (pool.constraints.nodes?.toOrFrom !== undefined) {
    for (const nodePoolName of pool.constraints.nodes.toOrFrom) {
      const node = permutation[nodePoolName];

      if (!(node instanceof Node)) {
        return false;
      }

      if (edge.nodes.from !== node && edge.nodes.to !== node) {
        return false;
      }
    }
  }

  return true;
}

function isSingleItem(input: QueryInput): input is QueryInputItem {
  return (
    !Array.isArray(input) &&
    input.constructor.name !== "Object"
  )
}

function checkIfAlreadyFound<
  Input extends QueryInput
>(
  output: QueryOutput<Input>,
  foundOutputs: QueryOutput<Input>[],
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
      const [foundKey, foundValue] = foundEntries[i]!;
      const [outputKey, outputValue] = outputEntries[i]!;

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

export function* arrayToGenerator<T>(array: T[]): Generator<T> {
  for (const item of array) {
    yield item;
  }
}

function isClassThatExtends<
  Parent extends Class<any>
>(
  child: Class<any>,
  parent: Parent,
): child is Parent {
  return (
    child === parent ||
    (parent.prototype?.isPrototypeOf(child.prototype) ?? false)
  );
}
