import type { QueryInput, QueryOutput } from "./run-query.types.ts";
export declare function deduplicateOutputs<Input extends QueryInput>(outputs: Generator<QueryOutput<Input>>): Generator<QueryOutput<Input>>;
