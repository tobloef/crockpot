import type { Edgelike, Nodelike, QueryInput, QueryOutput } from "./query.types.ts";
import type { Class } from "./utils/class.ts";
import { Node } from "./node.ts";
import { NodeQueryItem } from "./node-query-item.ts";
import { Edge } from "./edge.ts";
import { EdgeQueryItem } from "./edge-query-item.ts";
import { randomString } from "./utils/random-string.ts";
import type { Graph } from "./graph.ts";

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

type PoolName = string;

type Pools = {
  nodes: Record<PoolName, NodePool>,
  edges: Record<PoolName, EdgePool>,
}

type NodePool = {
  constraints: {
    instance?: Node,
    class?: Class<Node>,
    edges?: PoolName[],
  },
  outputKey?: string | number,
}

type EdgePool = {
  constraints: {
    instance?: Edge,
    class?: Class<Edge>,
    fromNode?: PoolName,
    toNode?: PoolName,
  },
  outputKey?: string | number,
}

function parseRootItem(
  item: Nodelike | Edgelike,
  pools: Pools,
  outputKey?: string | number,
) {
  if (isNodelike(item)) {
    const poolName = parseNode(item, pools);
    pools.nodes[poolName]!.outputKey = outputKey;
  } else {
    const poolName = parseEdge(item, pools);
    pools.edges[poolName]!.outputKey = outputKey;
  }
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

function parseNode(
  item: Nodelike,
  pools: Pools,
  parentEdge?: {
    poolName: PoolName,
    direction: "to" | "from",
  }
): PoolName {
  let poolName: PoolName;

  if (isClassThatExtends(item as Class<any>, Node)) {
    poolName = parseNodeClass(item as Class<Node>, pools);
  } else if (item instanceof Node) {
    poolName = parseNodeInstance(item, pools);
  } else if (item instanceof NodeQueryItem) {
    poolName = parseNodeQueryItem(item, pools);
  } else {
    throw new Error(`Invalid node item ${item}`);
  }

  if (parentEdge !== undefined) {
    const edgePool = pools.edges[parentEdge.poolName]!;
    const constraintKey = parentEdge.direction === "to" ? "toNode" : "fromNode";
    edgePool.constraints[constraintKey] = poolName;

    const nodePool = pools.nodes[poolName]!;
    nodePool.constraints.edges ??= [];
    nodePool.constraints.edges.push(parentEdge.poolName);
  }

  return poolName;
}

function parseNodeClass(item: Class<Node>, pools: Pools): PoolName {}

function parseNodeInstance(item: Node, pools: Pools): PoolName {}

function parseNodeQueryItem(item: NodeQueryItem, pools: Pools): PoolName {}

function parseEdge(
  item: Edgelike,
  pools: Pools,
  parentNode?: {
    poolName: PoolName,
    direction: "to" | "from",
  },
): PoolName {
  let poolName: PoolName;

  if (isClassThatExtends(item as Class<any>, Edge)) {
    poolName = parseEdgeClass(item as Class<Edge>, pools);
  } else if (item instanceof Edge) {
    poolName = parseEdgeInstance(item, pools);
  } else if (item instanceof EdgeQueryItem) {
    poolName = parseEdgeQueryItem(item, pools);
  } else {
    throw new Error(`Invalid edge item ${item}`);
  }

  if (parentNode !== undefined) {
    const nodePool = pools.nodes[parentNode.poolName]!;
    nodePool.constraints.edges ??= [];
    nodePool.constraints.edges.push(poolName);

    const edgePool = pools.edges[poolName]!;
    const constraintKey = parentNode.direction === "to" ? "toNode" : "fromNode";
    edgePool.constraints[constraintKey] = parentNode.poolName;
  }

  return poolName;
}

function parseEdgeClass(item: Class<Edge>, pools: Pools): PoolName {}

function parseEdgeInstance(item: Edge, pools: Pools): PoolName {}

function parseEdgeQueryItem(item: EdgeQueryItem, pools: Pools): PoolName {}

function parseInput(
  input: QueryInput,
): Pools {
  const pools: Pools = {
    nodes: {},
    edges: {},
  };

  if (isSingleItem(input)) {
    parseRootItem(input, pools);
  } else if (Array.isArray(input)) {
    for (let i = 0; i < input.length; i++) {
      const item = input[i]!;
      parseRootItem(item, pools, i);
    }
  } else {
    const entries = Object.entries(input);
    for (const [key, item] of entries) {
      parseRootItem(item, pools, key);
    }
  }

  return pools;
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

  if (pool.constraints.edges !== undefined) {
    for (const edgePoolName of pool.constraints.edges) {
      const edge = permutation[edgePoolName];

      if (!(edge instanceof Edge)) {
        return false;
      }

      if (!node.edges.includes(edge)) {
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

  if (pool.constraints.fromNode !== undefined) {
    const fromNode = permutation[pool.constraints.fromNode];

    if (!(fromNode instanceof Node)) {
      return false;
    }

    if (edge.nodes.from !== fromNode) {
      return false;
    }
  }

  if (pool.constraints.toNode !== undefined) {
    const toNode = permutation[pool.constraints.toNode];

    if (!(toNode instanceof Node)) {
      return false;
    }

    if (edge.nodes.to !== toNode) {
      return false;
    }
  }

  return true;
}



/////////////////////////////////////////////////////////////////

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

function isClassThatExtends(
  child: Class<any>,
  parent: Class<any>,
) {
  return (
    child === parent ||
    (parent.prototype?.isPrototypeOf(child.prototype) ?? false)
  );
}
