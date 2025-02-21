import type { QueryInput, QueryOutput, } from "./query.types.ts";
import type { Graph } from "../graph.ts";
import { parseInput } from "./parse-input.ts";
import { createPlan } from "./create-plan.ts";
import { executePlan } from "./execute-plan.ts";
import { createOutputs } from "./create-outputs.ts";
import { deduplicateOutputs } from "./deduplicate-outputs.ts";
import { arrayToGenerator } from "../utils/array-to-generator.ts";

export function* query<
  Input extends QueryInput
>(
  graph: Graph,
  input: Input,
): Generator<QueryOutput<Input>> {
  // TODO: Remove superfluous array conversions
  const slots = parseInput(input);
  const plan = createPlan(slots, graph);
  const matches = executePlan(plan).toArray();
  const matchesGenerator = arrayToGenerator(matches);
  const rawOutputs = createOutputs<Input>(matchesGenerator, slots).toArray();
  const rawOutputsGenerator = arrayToGenerator(rawOutputs);
  const deduplicatedOutput = deduplicateOutputs<Input>(rawOutputsGenerator).toArray();
  const deduplicatedOutputGenerator = arrayToGenerator(deduplicatedOutput);

  yield* deduplicatedOutputGenerator;
}

