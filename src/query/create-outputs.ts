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
  const outputSlots = getOutputSlots(slots);

  switch (slots.format) {
    case "single":
      yield* createSingleOutputs(matchesGenerator) as Generator<QueryOutput<Input>>;
      break;
    case "array":
      yield* createArrayOutputs(matchesGenerator, outputSlots) as Generator<QueryOutput<Input>>;
      break;
    case "object":
      yield* createRecordOutputs(matchesGenerator, outputSlots) as Generator<QueryOutput<Input>>;
      break;
    default:
      assertExhaustive(slots.format);
  }
}

function* createSingleOutputs(
  matches: Generator<QueryMatch>,
): Generator<QueryOutput<QueryInputItem>> {
  for (const match of matches) {
    const output = Object.values(match)[0] as QueryOutput<QueryInputItem>;
    yield output;
  }
}

function* createArrayOutputs(
  matches: Generator<QueryMatch>,
  outputSlots: Slot[]
): Generator<QueryOutput<ArrayQueryInput>> {
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
  outputSlots: Slot[]
): Generator<QueryOutput<ObjectQueryInput>> {
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
