import { Node } from "../node.ts";
import type { Class } from "../utils/class.ts";
import { Edge } from "../edge.ts";
import type { Graph } from "../graph.ts";

export type PoolName = string;

export type Pools = {
  nodes: Record<PoolName, NodePool>,
  edges: Record<PoolName, EdgePool>,
  unknown: Record<PoolName, NodePool & EdgePool>
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
  outputKey?: string | number,
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
  outputKey?: string | number,
}

export function getAnyPool(
  poolName: PoolName,
  pools: Pools
) {
  return (
    pools.nodes[poolName] ??
    pools.edges[poolName] ??
    pools.unknown[poolName]
  );
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

export function createPoolGeneratorFunctions(
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


export type GeneratorFunction<T> = () => Generator<T>;

export type PoolGeneratorFunctions = Record<PoolName, GeneratorFunction<any>>;

export type PermutationFromPoolGeneratorFunctions<Generators extends PoolGeneratorFunctions> = {
  [Key in keyof Generators]: (
    Generators[Key] extends GeneratorFunction<infer T> ? T : never
    )
}
