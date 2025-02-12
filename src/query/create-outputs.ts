import type { QueryMatch } from "./execute-plan.ts";
import { type QuerySlots, SLOT_TYPES, type UnknownSlot } from "./parse-input.ts";
import type { Node } from "../node/node.ts";
import type { Edge } from "../edge/edge.ts";
import { assertExhaustive } from "../utils/assert-exhaustive.ts";
import type { ArrayQueryInput, ObjectQueryInput, QueryInput, QueryInputItem, QueryOutput } from "./query.types.ts";

export function createOutputs<
  Input extends QueryInput
>(
  matches: Generator<QueryMatch>,
  slots: QuerySlots
): Generator<QueryOutput<Input>> {
  const outputSlots = getOutputSlots(slots);

  switch (slots.format) {
    case "single":
      return (createSingleOutputs(matches, outputSlots) as Generator<QueryOutput<Input>>);
    case "array":
      return (createArrayOutputs(matches, outputSlots) as Generator<QueryOutput<Input>>);
    case "object":
      return (createRecordOutputs(matches, outputSlots) as Generator<QueryOutput<Input>>);
    default:
      assertExhaustive(slots.format);
  }
}

function* createSingleOutputs(
  matches: Generator<QueryMatch>,
  outputSlots: UnknownSlot[]
): Generator<QueryOutput<QueryInputItem>> {
  for (const match of matches) {
    const slotName = outputSlots[0]!.name;
    yield match[slotName]! as QueryOutput<QueryInputItem>;
  }
}

function* createArrayOutputs(
  matches: Generator<QueryMatch>,
  outputSlots: UnknownSlot[]
): Generator<QueryOutput<ArrayQueryInput>> {
  for (const match of matches) {
    const output = [];

    for (const slot of outputSlots) {
      output.push(match[slot.name]!);
    }

    yield output as QueryOutput<ArrayQueryInput>;
  }
}

function* createRecordOutputs(
  matches: Generator<QueryMatch>,
  outputSlots: UnknownSlot[]
): Generator<QueryOutput<ObjectQueryInput>> {
  for (const match of matches) {
    const output: Record<string, Node | Edge> = {};

    for (const slot of outputSlots) {
      output[slot.name] = match[slot.name]!;
    }

    yield output as QueryOutput<ObjectQueryInput>;
  }
}

/** Get all slots that have any output keys. */
function getOutputSlots(
  slots: QuerySlots
): UnknownSlot[] {
  const allSlots = SLOT_TYPES
    .map((type) => Object.values(slots[type]))
    .flat();

  const slotsWithOutputKeys = allSlots
    .filter((slot) => slot.outputKeys.length > 0);

  return slotsWithOutputKeys;
}