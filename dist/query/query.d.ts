import type { QueryInput, QueryOutput } from "./query.types.ts";
import type { Graph } from "../graph.ts";
export declare function query<Input extends QueryInput>(graph: Graph, input: Input): Generator<QueryOutput<Input>>;
