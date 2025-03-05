import type { QueryMatch } from "./execute-plan.ts";
import { getAllSlots, type QuerySlots, type Slot } from "./parse-input.ts";
import { assertExhaustive } from "../utils/assert-exhaustive.ts";
import type { ArrayQueryInput, ObjectQueryInput, QueryInput, QueryInputItem, QueryOutput } from "./run-query.types.ts";

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
      yield* createObjectOutputs(matchesGenerator, slots) as Generator<QueryOutput<Input>>;
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
    const output = match[slot.name]! as QueryOutput<QueryInputItem>;

    (output as WithHash).__hash = getOutputHash(output);

    yield output;
  }
}

function* createArrayOutputs(
  matches: Generator<QueryMatch>,
  slots: QuerySlots,
): Generator<QueryOutput<ArrayQueryInput>> {
  const outputSlots = getOutputSlots(slots);

  for (const match of matches) {
    const output: QueryOutput<ArrayQueryInput> = [];

    for (const slot of outputSlots) {
      for (const key of slot.outputKeys) {
        (output[key as number] as any) = match[slot.name]!;
      }
    }

    (output as unknown as WithHash).__hash = getOutputHash(output);

    yield output;
  }
}

function* createObjectOutputs(
  matches: Generator<QueryMatch>,
  slots: QuerySlots,
): Generator<QueryOutput<ObjectQueryInput>> {
  const outputSlots = getOutputSlots(slots);

  for (const match of matches) {
    const output: QueryOutput<ObjectQueryInput> = {};

    for (const slot of outputSlots) {
      for (const key of slot.outputKeys) {
        output[key] = match[slot.name]!;
      }
    }

    (output as WithHash).__hash = getOutputHash(output);

    yield output;
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

export function getOutputHash<
  Input extends QueryInput
>(output: QueryOutput<Input>): string {
  if (output.id !== undefined) {
    return output.id;
  }

  const hash = Object.values(output)
    .map((item) => (item as { id: string }).id)
    .join();

  return hash;
}

export type WithHash = {
  __hash: string;
}