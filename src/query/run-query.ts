import type {
  ArrayQueryInput,
  ObjectQueryInput,
  QueryInput,
  QueryInputItem,
  QueryOutput,
  QueryOutputItem,
} from "./run-query.types.ts";
import type { Graph } from "../graph.ts";
import {
  parseInput,
  type QuerySlots,
} from "./parse-input.ts";
import { createPlan } from "./create-plan.ts";
import { executePlan } from "./execute-plan.ts";
import { createOutputs } from "./create-outputs.ts";
import { deduplicateOutputs } from "./deduplicate-outputs.ts";

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
): Generator<QueryOutput<Input>>;

export function* runQuery<
  Input extends QueryInput
>(
  graph: Graph,
  input: Input,
): Generator<QueryOutput<Input>> {
  const slots = parseInput(input);

  if (slotsHaveNoItems(slots)) {
    throw new Error("Cannot query with empty input.");
  }

  if (slotsAreAllOptional(slots)) {
    throw new Error("Cannot query with only optional items.");
  }

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

function slotsHaveNoItems(slots: QuerySlots): boolean {
  return (
    Object.keys(slots.node).length === 0 &&
    Object.keys(slots.edge).length === 0 &&
    Object.keys(slots.unknown).length === 0
  )
}

function slotsAreAllOptional(slots: QuerySlots): boolean {
  return (
    Object.values(slots.node).every((s) => s.optionalityKeys !== null) &&
    Object.values(slots.edge).every((s) => s.optionalityKeys !== null) &&
    Object.values(slots.unknown).every((s) => s.optionalityKeys !== null)
  )
}
