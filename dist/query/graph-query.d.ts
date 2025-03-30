import type { QueryInput, QueryOutput } from "./run-query.types.ts";
import type { Graph } from "../graph.ts";
export type GraphQueryOptions = {
    cache?: boolean;
};
export declare class GraphQuery<Output extends QueryOutput<any>> {
    #private;
    readonly graph: Graph;
    readonly input: QueryInput;
    readonly options: Readonly<GraphQueryOptions>;
    constructor(graph: Graph, input: QueryInput, options?: GraphQueryOptions);
    run(): Iterable<Output>;
    destroy(): void;
}
