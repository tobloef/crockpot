import type { QueryMatch } from "./execute-plan.ts";
import { type QuerySlots } from "./parse-input.ts";
import type { QueryInput, QueryOutput } from "./run-query.types.ts";
export declare function createOutputs<Input extends QueryInput>(matchesGenerator: Generator<QueryMatch>, slots: QuerySlots): Generator<QueryOutput<Input>>;
export declare const getOutputHash: <Input extends QueryInput>(input: QueryOutput<Input>) => string;
