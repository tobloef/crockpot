import type { QueryMatch } from "./execute-plan.ts";
import { type QuerySlots } from "./parse-input.ts";
import type { QueryInput, QueryOutput } from "./query.types.ts";
export declare function createOutputs<Input extends QueryInput>(matchesGenerator: Generator<QueryMatch>, slots: QuerySlots): Generator<QueryOutput<Input>>;
