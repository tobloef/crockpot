import { Node } from "../node/node.ts";
import type { Class } from "../utils/class.ts";
import { Edge } from "../edge/edge.ts";
import type { Graph } from "../graph.ts";

export type PoolName = string;
export type PoolType = keyof Pools;
export const POOL_TYPES = ['node', 'edge', 'unknown'] as const satisfies PoolType[];

export type Pools = {
  node: Record<PoolName, NodePool>,
  edge: Record<PoolName, EdgePool>,
  unknown: Record<PoolName, NodePool | EdgePool>
}

export type NodePool = {
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
  outputKeys: string[] | number[],
}

export type EdgePool = {
  constraints: {
    instance?: Edge,
    class?: Class<Edge>,
    nodes?: {
      to?: PoolName,
      from?: PoolName,
      toOrFrom?: PoolName[],
    }
  },
  outputKeys: string[] | number[],
}

export type GeneratorFunction<T> = () => Generator<T>;

export type PoolGeneratorFunctions = Record<PoolName, GeneratorFunction<any>>;

export type PermutationFromPoolGeneratorFunctions<Generators extends PoolGeneratorFunctions> = {
  [Key in keyof Generators]: (
    Generators[Key] extends GeneratorFunction<infer T> ? T : never
  )
}

export function getPoolByName(
  poolName: PoolName,
  pools: Pools
) {
  return (
    pools.node[poolName] ??
    pools.edge[poolName] ??
    pools.unknown[poolName]
  );
}

export function createPoolGeneratorFunctions(
  graph: Graph,
  pools: Pools,
): Record<PoolName, GeneratorFunction<Node | Edge>> {
  const generatorFunctions: Record<PoolName, GeneratorFunction<Node | Edge>> = {};

  const nodeGeneratorFunction = () => setToGenerator(graph.indices.allNodes);
  const edgeGeneratorFunction = () => setToGenerator(graph.indices.allEdges);
  const nodeAndEdgeGeneratorFunction = () => combineGenerators<Node | Edge>(
    nodeGeneratorFunction(),
    edgeGeneratorFunction()
  );

  for (const poolName of Object.keys(pools.node)) {
    generatorFunctions[poolName] = nodeGeneratorFunction;
  }

  for (const poolName of Object.keys(pools.edge)) {
    generatorFunctions[poolName] = edgeGeneratorFunction;
  }

  for (const poolName of Object.keys(pools.unknown)) {
    generatorFunctions[poolName] = nodeAndEdgeGeneratorFunction;
  }

  return generatorFunctions;
}

export function* permuteGenerators<
  GenFuncs extends PoolGeneratorFunctions
>(
  generatorFunctions: GenFuncs,
): Generator<PermutationFromPoolGeneratorFunctions<GenFuncs>> {
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
      yield permutation as PermutationFromPoolGeneratorFunctions<GenFuncs>;
    } else {
      const otherPermutations = permuteGenerators(otherGeneratorFunctions);

      for (const otherPermutation of otherPermutations) {
        const permutation = { [firstKey]: item, ...otherPermutation };
        yield permutation as PermutationFromPoolGeneratorFunctions<GenFuncs>;
      }
    }
  }
}

export function* arrayToGenerator<T>(array: T[]): Generator<T> {
  for (const item of array) {
    yield item;
  }
}

export function* setToGenerator<T>(set: Set<T>): Generator<T> {
  for (const item of set) {
    yield item;
  }
}

export function* combineGenerators<T>(...generators: Generator<T>[]): Generator<T> {
  for (const generator of generators) {
    yield* generator;
  }
}

export function countPermutations(generators: PoolGeneratorFunctions) {
  return Object.values(generators).reduce((acc, gen) => acc * gen().toArray().length, 1);
}

export function getPoolKeys(pools: Pools) {
  return [
    ...Object.keys(pools.node),
    ...Object.keys(pools.edge),
    ...Object.keys(pools.unknown),
  ];
}