import type { ArrayQueryInput, ObjectQueryInput, QueryInput, QueryInputItem, QueryOutput, QueryOutputItem } from "./run-query.types.js";
import type { Graph } from "../graph.js";
import { parseInput, type QuerySlots } from "./parse-input.js";
import { createPlan } from "./create-plan.js";
import { executePlan } from "./execute-plan.js";
import { createOutputs } from "./create-outputs.js";
import { deduplicateOutputs } from "./deduplicate-outputs.js";

export function runQuery<Input extends QueryInputItem>(
  graph: Graph,
  input: Input
): Generator<QueryOutput<Input>>;

export function runQuery<Input extends ArrayQueryInput>(
  graph: Graph,
  input: [...Input]
): Generator<QueryOutput<Input>>;

export function runQuery<Input extends ObjectQueryInput>(
  graph: Graph,
  input: Input
): Generator<(
  // Type duplicated from ObjectQueryOutput to fix type hints.
  // If ObjectQueryOutput or QueryOutput is used directly, it shows up as:
  // Generator<ObjectQueryOutput<
  //   { Transform: typeof Transform },
  //   { Transform: typeof Transform }
  // >, any, any>
  { [K in keyof Input]: QueryOutputItem<Input[K], Input> }
)>;

export function* runQuery<
  Input extends QueryInput
>(
  graph: Graph,
  input: Input,
): Generator<QueryOutput<Input>> {
  const slots = parseInput(input);

  yield* runQueryBySlots(graph, slots);
}

export function* runQueryBySlots<
  Input extends QueryInput
>(
  graph: Graph,
  slots: QuerySlots,
): Generator<QueryOutput<Input>> {
  const plan = createPlan(slots, graph);
  const matchesGenerator = executePlan(plan);
  const rawOutputsGenerator = createOutputs<Input>(matchesGenerator, slots);
  const deduplicatedOutputGenerator = deduplicateOutputs<Input>(rawOutputsGenerator);

  yield* deduplicatedOutputGenerator;
}