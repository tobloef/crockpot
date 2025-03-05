import type { Class } from "../utils/class.ts";
import type { Nodelike, ReferenceName } from "../query/run-query.types.ts";
import type { Node } from "../node/node.ts";
import { type Graph } from "../graph.ts";
import { NamedEdgeQueryItem, RelatedEdgeQueryItem } from "./edge-query-item.ts";
export declare class Edge {
    #private;
    static defaultGraph: Graph;
    readonly id: string;
    graph: Readonly<Graph>;
    get nodes(): EdgeNodes;
    static as<Type extends Class<Edge>, Name extends ReferenceName>(this: Type, name: Name): NamedEdgeQueryItem<Type, Name>;
    static to<Type extends Class<Edge>, ToItem extends Nodelike>(this: Type, item: ToItem): RelatedEdgeQueryItem<Type, ToItem, Nodelike, Nodelike[]>;
    static from<Type extends Class<Edge>, FromItem extends Nodelike>(this: Type, item: FromItem): RelatedEdgeQueryItem<Type, Nodelike, FromItem, Nodelike[]>;
    static fromOrTo<Type extends Class<Edge>, FromOrToItems extends Nodelike[]>(this: Type, ...items: FromOrToItems): RelatedEdgeQueryItem<Type, Nodelike, Nodelike, FromOrToItems>;
    remove(): void;
}
export type EdgeNodes = Readonly<{
    from?: Node;
    to?: Node;
}>;
export type EdgeDirection = "from" | "to" | "fromOrTo";
