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

  const permutationCount = Object.values(generators).reduce((acc, gen) => acc * gen().toArray().length, 1);

  const permutations = permuteGenerators(generators);

  const foundOutputs: QueryOutput<Input>[] = [];

  let i = 0;
  const startTime = Date.now();
  const expectedDuration = 5.64 * 60 * 1000;

  for (const permutation of permutations) {
    i++;
    if (i % 1000000 === 0) {
      console.log(
        Math.round(((Date.now() - startTime) / 1000 / 60) * 100) / 100,
        "minutes",
        i.toLocaleString(),
        "/",
        permutationCount.toLocaleString(),
        ":",
        foundOutputs.length.toLocaleString()
      );
    }
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
