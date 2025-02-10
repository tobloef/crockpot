import type { QueryInput, QueryOutput, QueryOutputItem } from "./query.types.ts";
import { Node } from "../node/node.ts";
import { Edge } from "../edge/edge.ts";
import type { Pools } from "./pool.ts";
import { isSingleItem } from "./parsing.ts";

export function permutationToOutput<
  Input extends QueryInput
>(
  permutation: Record<string, Node | Edge>,
  pools: Pools,
  input: Input,
): QueryOutput<Input> {
  if (isSingleItem(input)) {
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

export type FoundOutputs = Record<
  string | number,
  Set<QueryOutputItem<any, any>>
>

export function checkIfAlreadyFound<Input extends QueryInput>(
  output: QueryOutput<Input>,
  foundOutputs: FoundOutputs,
): boolean {
  const isOutputSingleItem = isSingleItem(output);

  if (isOutputSingleItem) {
    if (foundOutputs[0] === undefined) {
      return false;
    }

    return foundOutputs[0].has(output);
  } else {
    for (const [key, value] of Object.entries(output)) {
      if (foundOutputs[key] === undefined) {
        return false;
      }

      if (!foundOutputs[key].has(value)) {
        return false;
      }
    }

    return true;
  }
}

export function addToAlreadyFound<Input extends QueryInput>(
  output: QueryOutput<Input>,
  foundOutputs: FoundOutputs,
): void {
  const isOutputSingleItem = isSingleItem(output);

  if (isOutputSingleItem) {
    if (foundOutputs[0] === undefined) {
      foundOutputs[0] = new Set();
    }

    foundOutputs[0].add(output);
  } else {
    for (const [key, value] of Object.entries(output)) {
      if (foundOutputs[key] === undefined) {
        foundOutputs[key] = new Set();
      }

      foundOutputs[key].add(value);
    }
  }
}