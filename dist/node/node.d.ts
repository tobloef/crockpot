import { Edge, type EdgeDirection } from "../edge/edge.ts";
import { type Class, type Instance } from "../utils/class.ts";
import type { Edgelike, Nodelike, ReferenceName } from "../query/run-query.types.ts";
import { type Graph } from "../graph.ts";
import { NamedNodeQueryItem, NodeQueryItem, RelatedNodeQueryItem } from "./node-query-item.ts";
export declare class Node {
    #private;
    static defaultGraph: Graph;
    readonly id: string;
    graph: Graph;
    get edges(): NodeEdges;
    static excluding<Type extends Class<Node>>(this: Type, ...excludedClassTypes: Class<Node>[]): NodeQueryItem<Type>;
    static as<Type extends Class<Node>, Name extends ReferenceName>(this: Type, name: Name): NamedNodeQueryItem<Type, Name>;
    static with<Type extends Class<Node>, WithItems extends Edgelike[]>(this: Type, ...items: WithItems): RelatedNodeQueryItem<Type, WithItems, [], [], []>;
    static to<Type extends Class<Node>, ToItems extends Nodelike[]>(this: Type, ...items: ToItems): RelatedNodeQueryItem<Type, [], ToItems, [], []>;
    static from<Type extends Class<Node>, FromItems extends Nodelike[]>(this: Type, ...items: FromItems): RelatedNodeQueryItem<Type, [], [], FromItems, []>;
    static fromOrTo<Type extends Class<Node>, FromOrToItems extends Nodelike[]>(this: Type, ...items: FromOrToItems): RelatedNodeQueryItem<Type, [], [], [], FromOrToItems>;
    addEdge<Input extends AddEdgeInput>(input: Input): AddedEdge<Input>;
    removeEdge(edge: Edge): void;
    removeEdges(input?: RemoveEdgeInput): void;
    remove(): void;
    getOneRelated<NodeType extends Class<Node> = Class<Node>, EdgeType extends Class<Edge> = Class<Edge>>(edgeType: EdgeType, direction: EdgeDirection, nodeType: NodeType): {
        node: Instance<NodeType>;
        edge: Instance<EdgeType>;
    } | undefined;
    getAllRelated<NodeType extends Class<Node> = Class<Node>, EdgeType extends Class<Edge> = Class<Edge>>(edgeType: EdgeType, direction: EdgeDirection, nodeType: NodeType): Iterable<{
        node: Instance<NodeType>;
        edge: Instance<EdgeType>;
    }>;
}
export type AddEdgeInput = ({
    to: Node;
    edge?: Edge;
} | {
    from: Node;
    edge?: Edge;
});
export type RemoveEdgeInput = ({
    to: Node;
    type?: Class<Edge>;
} | {
    from: Node;
    type?: Class<Edge>;
} | {
    type: Class<Edge>;
});
export type NodeEdges = Readonly<{
    from: ReadonlySet<Edge>;
    to: ReadonlySet<Edge>;
}>;
type AddedEdge<Input extends AddEdgeInput> = (Input["edge"] extends Edge ? Input["edge"] : Edge);
export {};
