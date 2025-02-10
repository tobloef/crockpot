import type { QueryInput, QueryOutput } from "./query.types.ts";
import { Node } from "../node/node.ts";
import { Edge } from "../edge/edge.ts";
import type { Pools } from "./pool.ts";

export function permutationToOutput<
  Input extends QueryInput
>(
  permutation: Record<string, Node | Edge>,
  pools: Pools,
  input: Input,
  isOutputSingleItem: boolean,
): QueryOutput<Input> {
  if (isOutputSingleItem) {
    const onlyPoolName = (
      Object.keys(pools.node)[0]! ??
      Object.keys(pools.edge)[0]! ??
      Object.keys(pools.unknown)[0]!
    );

    return permutation[onlyPoolName] as QueryOutput<Input>;
  } else if (Array.isArray(input)) {
    const output = [];

    const allPools = { ...pools.node, ...pools.edge, ...pools.unknown };

    for (const [poolName, pool] of Object.entries(allPools)) {
      const item = permutation[poolName];

      for (const outputKey of pool.outputKeys) {
        output[outputKey as number] = item;
      }
    }

    return output as QueryOutput<Input>;
  } else {
    const output: Record<string, Node | Edge | undefined> = {};

    const allPools = { ...pools.node, ...pools.edge, ...pools.unknown };

    for (const [poolName, pool] of Object.entries(allPools)) {
      const item = permutation[poolName];

      for (const outputKey of pool.outputKeys) {
        output[outputKey as string] = item;
      }
    }

    return output as QueryOutput<Input>;
  }
}

export type FoundOutputs = Set<string>;

export function checkIfAlreadyFound<Input extends QueryInput>(
  output: QueryOutput<Input>,
  foundOutputs: FoundOutputs,
  isOutputSingleItem: boolean,
): boolean {
  if (isOutputSingleItem) {
    return foundOutputs.has(output.id);
  } else {
    const compositeId = Object.values(output)
      .map((item) => (item as { id: string }).id)
      .join();
    return foundOutputs.has(compositeId);
  }
}

export function addToAlreadyFound<Input extends QueryInput>(
  output: QueryOutput<Input>,
  foundOutputs: FoundOutputs,
  isOutputSingleItem: boolean,
): void {
  if (isOutputSingleItem) {
    foundOutputs.add(output.id);
  } else {
    const compositeId = Object.values(output)
      .map((item) => (item as { id: string }).id)
      .join();
    foundOutputs.add(compositeId);
  }
}