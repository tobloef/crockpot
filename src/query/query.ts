import type { QueryInput, QueryOutput, QueryOutputItem, } from "./query.types.ts";
import type { Graph } from "../graph.ts";
import { isSingleItem, parseInput } from "./parsing.ts";
import { addToAlreadyFound, checkIfAlreadyFound, type FoundOutputs, permutationToOutput } from "./output.ts";
import { checkConstraints } from "./constraints.ts";
import { countGeneratorPermutations, countSetPermutations, createPoolGeneratorFunctions, createPoolSets, getPoolKeys, permuteGenerators, permuteSets } from "./pool.ts";

export function* query<
  Input extends QueryInput
>(
  graph: Graph,
  input: Input,
): Generator<QueryOutput<Input>> {
  const pools = parseInput(input);

  /*
  const sets = createPoolSets(graph, pools);

  const permutations = permuteSets(sets);

  console.log(`Permutation count: ${countSetPermutations(sets).toLocaleString()}`);
  */

  const generators = createPoolGeneratorFunctions(graph, pools);

  const permutations = permuteGenerators(generators);

  console.log(`Permutation count: ${countGeneratorPermutations(generators).toLocaleString()}`);
  console.log(`Pools:\n\t${getPoolKeys(pools).join("\n\t")}`);

  const isOutputSingleItem = isSingleItem(input);

  const foundOutputs: FoundOutputs = {};

  for (const permutation of permutations) {
    const output = permutationToOutput(permutation, pools, input, isOutputSingleItem);

    const wasAlreadyFound = checkIfAlreadyFound(output, foundOutputs, isOutputSingleItem);

    if (wasAlreadyFound) {
      continue;
    }

    const passesConstraints = checkConstraints(permutation, pools);

    if (!passesConstraints) {
      continue;
    }

    addToAlreadyFound(output, foundOutputs, isOutputSingleItem);

    yield output;
  }
}
