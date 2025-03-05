import type { QueryInput, QueryOutput } from "./run-query.types.ts";
import type { Graph } from "../graph.ts";
export type GraphQueryOptions = {
    cache?: boolean;
};
export declare class GraphQuery<Input extends QueryInput, Output extends QueryOutput<any>> {
    #private;
    readonly graph: Graph;
    readonly input: Input;
    readonly options: Readonly<GraphQueryOptions>;
    constructor(graph: Graph, input: Input, options?: GraphQueryOptions);
    run(): Iterable<Output>;
    destroy(): void;
}
