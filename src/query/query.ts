import type { QueryInput, QueryOutput, } from "./query.types.ts";
import type { Graph } from "../graph.ts";
import { parseInput } from "./parse-input.ts";
import { createPlan } from "./create-plan.ts";
import { executePlan } from "./execute-plan.ts";
import { createOutputs } from "./create-outputs.ts";
import { deduplicateOutputs } from "./deduplicate-outputs.ts";

export function* query<
  Input extends QueryInput
>(
  graph: Graph,
  input: Input,
): Generator<QueryOutput<Input>> {
  const slots = parseInput(input);
  const plan = createPlan(slots, graph);
  const matches = executePlan(plan, graph);
  const rawOutputs = createOutputs(matches, slots);
  const deduplicatedOutputs = deduplicateOutputs(rawOutputs);

  return deduplicatedOutputs;
}

