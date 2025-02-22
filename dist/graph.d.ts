import { Edge } from "./edge/edge.ts";
import { Node } from "./node/node.ts";
import type { ArrayQueryInput, ObjectQueryInput, QueryInputItem, QueryOutput, QueryOutputItem } from "./query/query.types.ts";
import { type Class } from "./utils/class.ts";
export declare class Graph {
    indices: {
        nodesByEdge: Map<Edge, {
            from: Node;
            to: Node;
        }>;
        edgesByNode: Map<Node, {
            from: Set<Edge>;
            to: Set<Edge>;
        }>;
        nodesByType: Map<Class<Node>, Set<Node>>;
        edgesByType: Map<Class<Edge>, Set<Edge>>;
    };
    query<Input extends QueryInputItem>(input: Input): Generator<QueryOutput<Input>>;
    query<Input extends ArrayQueryInput>(input: [...Input]): Generator<QueryOutput<Input>>;
    query<Input extends ObjectQueryInput>(input: Input): Generator<({
        [K in keyof Input]: QueryOutputItem<Input[K], Input>;
    })>;
    addNode<N extends Node>(node: N): N;
    addNodes<Nodes extends Node[]>(nodes: Nodes): Nodes;
    removeNode(node: Node): void;
    removeNodes(nodes: Node[]): void;
    removeNodesByType(type: Class<Node>): void;
    addEdge<E extends Edge>(input: AddEdgeInput<E>): E;
    removeEdge(edge: Edge): void;
    removeEdges(edges: Edge[]): void;
    removeEdgesByNodes(input: RemoveEdgesInput): void;
    removeEdgesByType(type: Class<Edge>): void;
}
export type AddEdgeInput<E extends Edge> = {
    to: Node;
    from: Node;
    edge?: E;
};
export type RemoveEdgesInput = ({
    from: Node;
    to?: Node;
    type?: Class<Edge>;
} | {
    from?: Node;
    to: Node;
    type?: Class<Edge>;
} | {
    fromOrTo: Node;
    type?: Class<Edge>;
});
export declare const defaultGraph: Graph;
