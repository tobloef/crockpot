import type { ArrayQueryInput, ObjectQueryInput, QueryInput, QueryInputItem, QueryOutput, QueryOutputItem } from "./run-query.types.ts";
import type { Graph } from "../graph.ts";
import { type QuerySlots } from "./parse-input.ts";
export declare function runQuery<Input extends QueryInputItem>(graph: Graph, input: Input): Generator<QueryOutput<Input>>;
export declare function runQuery<Input extends ArrayQueryInput>(graph: Graph, input: [...Input]): Generator<QueryOutput<Input>>;
export declare function runQuery<Input extends ObjectQueryInput>(graph: Graph, input: Input): Generator<({
    [K in keyof Input]: QueryOutputItem<Input[K], Input>;
})>;
export declare function runQueryBySlots<Input extends QueryInput>(graph: Graph, slots: QuerySlots): Generator<QueryOutput<Input>>;
