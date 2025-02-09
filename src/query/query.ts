import type { QueryInput, QueryOutput, } from "./query.types.ts";
import type { Graph } from "../graph.ts";
import { parseInput } from "./parsing.ts";
import { checkIfAlreadyFound, permutationToOutput } from "./output.ts";
import { checkConstraints } from "./constraints.ts";
import { createPoolGeneratorFunctions, permuteGenerators } from "./pool.ts";
import { memoryUsage } from "process";

export function* query<
  Input extends QueryInput
>(
  graph: Graph,
  input: Input,
): Generator<QueryOutput<Input>> {
  const pools = parseInput(input);
  const generators = createPoolGeneratorFunctions(graph, pools);

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
