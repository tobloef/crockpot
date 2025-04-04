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
    /**
     * Get one related node and edge.
     * @param {Object} [input]
     * @param {Class<Node>} [input.nodeType] - The type of the related node.
     * @param {Class<Edge>} [input.edgeType] - The type of the edge between the nodes.
     * @param {EdgeDirection} [input.direction] - The direction of the edge. Whether it's going "to" the related node or coming "from" it.
     */
    getOneRelated<NodeType extends Class<Node> = Class<Node>, EdgeType extends Class<Edge> = Class<Edge>>(input?: {
        nodeType?: NodeType;
        direction?: EdgeDirection;
        edgeType?: EdgeType;
    }): {
        node: Instance<NodeType>;
        edge: Instance<EdgeType>;
    } | undefined;
    /**
     * Get multiple related nodes and edges.
     * @param {Object} [input]
     * @param {Class<Node>} [input.nodeType] - The type of the related nodes.
     * @param {Class<Edge>} [input.edgeType] - The type of the edges between the nodes.
     * @param {EdgeDirection} [input.direction] - The direction of the edges. Whether it's going "to" the related nodes or coming "from" them.
     */
    getAllRelated<NodeType extends Class<Node> = Class<Node>, EdgeType extends Class<Edge> = Class<Edge>>(input?: {
        nodeType?: NodeType;
        direction?: EdgeDirection;
        edgeType?: EdgeType;
    }): Iterable<{
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
