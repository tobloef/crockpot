import type { QueryInput, QueryOutput } from "./query.types.ts";
import { Node } from "../node/node.ts";
import { Edge } from "../edge/edge.ts";
import type { Pools } from "./pool.ts";
import { isSingleItem } from "./misc.ts";

export function permutationToOutput<
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

export function checkIfAlreadyFound<
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
