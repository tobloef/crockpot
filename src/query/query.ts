import type { Edgelike, Nodelike, QueryInput, QueryInputItem, QueryOutput, ReferenceName, } from "./query.types.ts";
import type { Graph } from "../graph.ts";
import { parseInput } from "./parse-input.ts";

export function* query2<
  Input extends QueryInput
>(
  graph: Graph,
  input: Input,
): Generator<QueryOutput<Input>> {
  const slots = parseInput(input);
  const plan = createPlan(slots);
  const matches = executePlan(plan, graph);
  const rawOutputs = createOutputs(matches, slots);
  const deduplicatedOutputs = deduplicateOutputs(rawOutputs);

  return deduplicatedOutputs;
}

