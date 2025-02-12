import type { QueryMatch } from "./execute-plan.ts";
import type { QuerySlots } from "./parse-input.ts";

export type QueryOutput = {

};

export function createOutputs(
  matches: Generator<QueryMatch>,
  slots: QuerySlots
): Generator<QueryOutput> {

}
