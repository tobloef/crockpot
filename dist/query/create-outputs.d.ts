import type { QueryMatch } from "./execute-plan.ts";
import { type QuerySlots } from "./parse-input.ts";
import type { QueryInput, QueryOutput } from "./run-query.types.ts";
export declare function createOutputs<Input extends QueryInput>(matchesGenerator: Generator<QueryMatch>, slots: QuerySlots): Generator<QueryOutput<Input>>;
export declare function getOutputHash<Input extends QueryInput>(output: QueryOutput<Input>): string;
