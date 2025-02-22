import type { QueryInput, QueryOutput } from "./query.types.ts";
export declare function deduplicateOutputs<Input extends QueryInput>(outputs: Generator<QueryOutput<Input>>): Generator<QueryOutput<Input>>;
