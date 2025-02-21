import type { QueryMatch } from "./execute-plan.ts";
import { getAllSlots, type QuerySlots, type Slot } from "./parse-input.ts";
import type { Node } from "../node/node.ts";
import type { Edge } from "../edge/edge.ts";
import { assertExhaustive } from "../utils/assert-exhaustive.ts";
import type { ArrayQueryInput, ObjectQueryInput, QueryInput, QueryInputItem, QueryOutput } from "./query.types.ts";

export function* createOutputs<
  Input extends QueryInput
>(
  matchesGenerator: Generator<QueryMatch>,
  slots: QuerySlots
): Generator<QueryOutput<Input>> {
  switch (slots.format) {
    case "single":
      yield* createSingleOutputs(matchesGenerator, slots) as Generator<QueryOutput<Input>>;
      break;
    case "array":
      yield* createArrayOutputs(matchesGenerator, slots) as Generator<QueryOutput<Input>>;
      break;
    case "object":
      yield* createRecordOutputs(matchesGenerator, slots) as Generator<QueryOutput<Input>>;
      break;
    default:
      assertExhaustive(slots.format);
  }
}

function* createSingleOutputs(
  matches: Generator<QueryMatch>,
  slots: QuerySlots,
): Generator<QueryOutput<QueryInputItem>> {
  const slot = getAllSlots(slots)[0]!;
  for (const match of matches) {
    const output = match[slot.name]!;
    yield output;
  }
}

function* createArrayOutputs(
  matches: Generator<QueryMatch>,
  slots: QuerySlots,
): Generator<QueryOutput<ArrayQueryInput>> {
  const outputSlots = getOutputSlots(slots);

  for (const match of matches) {
    const output = [];

    for (const slot of outputSlots) {
      for (const key of slot.outputKeys) {
        output[key as number] = match[slot.name]!;
      }
    }

    yield output as QueryOutput<ArrayQueryInput>;
  }
}

function* createRecordOutputs(
  matches: Generator<QueryMatch>,
  slots: QuerySlots,
): Generator<QueryOutput<ObjectQueryInput>> {
  const outputSlots = getOutputSlots(slots);

  for (const match of matches) {
    const output: Record<string, Node | Edge> = {};

    for (const slot of outputSlots) {
      for (const key of slot.outputKeys) {
        output[key] = match[slot.name]!;
      }
    }

    yield output as QueryOutput<ObjectQueryInput>;
  }
}

/** Get all slots that have any output keys. */
function getOutputSlots(
  slots: QuerySlots
): Slot[] {
  const allSlots = getAllSlots(slots);

  const slotsWithOutputKeys = allSlots
    .filter((slot) => slot.outputKeys.length > 0);

  return slotsWithOutputKeys;
}
