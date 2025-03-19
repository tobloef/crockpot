import type { QueryInput, QueryOutput } from "./run-query.types.ts";
import type { Graph } from "../graph.ts";
export type GraphObserverOptions = {};
export declare class GraphObserver<Output extends QueryOutput<any>> {
    #private;
    readonly graph: Graph;
    readonly input: QueryInput;
    readonly options: GraphObserverOptions;
    constructor(graph: Graph, input: QueryInput, options?: GraphObserverOptions);
    added(): Generator<Output>;
    removed(): Generator<Output>;
    onAdded(listener: (item: Output) => void): void;
    onRemoved(listener: (item: Output) => void): void;
    destroy(): void;
}
