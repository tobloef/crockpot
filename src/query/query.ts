import type { QueryInput, QueryOutput, QueryOutputItem, } from "./query.types.ts";
import type { Graph } from "../graph.ts";
import { parseInput } from "./parsing.ts";
import { addToAlreadyFound, checkIfAlreadyFound, type FoundOutputs, permutationToOutput } from "./output.ts";
import { checkConstraints } from "./constraints.ts";
import { countPermutations, createPoolGeneratorFunctions, getPoolKeys, permuteGenerators } from "./pool.ts";

export function* query<
  Input extends QueryInput
>(
  graph: Graph,
  input: Input,
): Generator<QueryOutput<Input>> {
  const pools = parseInput(input);
  const generators = createPoolGeneratorFunctions(graph, pools);

  const permutations = permuteGenerators(generators);

  console.log(`Permutation count: ${countPermutations(generators).toLocaleString()}`);
  console.log(`Pools:\n\t${getPoolKeys(pools).join("\n\t")}`);

  const foundOutputs: FoundOutputs = {};

  for (const permutation of permutations) {
    const output = permutationToOutput(permutation, pools, input);

    const wasAlreadyFound = checkIfAlreadyFound(output, foundOutputs);

    if (wasAlreadyFound) {
      continue;
    }

    const passesConstraints = checkConstraints(permutation, pools);

    if (!passesConstraints) {
      continue;
    }

    addToAlreadyFound(output, foundOutputs);

    yield output;
  }
}
