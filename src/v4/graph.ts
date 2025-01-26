import { Edge } from "./edge.ts";
import type { Node } from "./node.ts";
import { NotImplementedError } from "./utils/errors/not-implemented-error.ts";
import type {
  ArrayQueryInput,
  ObjectQueryInput,
  QueryInput,
  QueryInputItem,
  QueryOutput,
  QueryOutputItem,
} from "./query.types.ts";
import { query } from "./query.ts";
import { writeable } from "./utils/writeable.ts";
import type { Class } from "./utils/class.ts";

export class Graph {
  indices = {
    allNodes: new Set<Node>(),
    allEdges: new Set<Edge>(),
    nodesByEdge: new Map<Edge, { from: Node, to: Node }>(),
    edgesByNode: new Map<Node, { from: Set<Edge>, to: Set<Edge> }>(),
  };

  query<Input extends QueryInputItem>(input: Input): Generator<QueryOutput<Input>>;

  query<Input extends ArrayQueryInput>(input: [...Input]): Generator<QueryOutput<Input>>;

  query<Input extends ObjectQueryInput>(input: Input): Generator<(
    // Return type duplicated from ObjectQueryOutput to make type hints show up correctly
    // If ObjectQueryOutput is used directly, for some reason it shows up as:
    // Generator<ObjectQueryOutput<{ Transform: typeof Transform }, { Transform: typeof Transform }>, any, any>
    { [K in keyof Input]: QueryOutputItem<Input[K], Input> }
  )>;

  query<Input extends QueryInput>(input: Input): Generator<QueryOutput<Input>> {
    return query(this, input);
  }

  addNode<N extends Node>(node: N): N {
    // TODO

    return node;
  }

  addNodes<Ns extends Node[]>(nodes: Ns): Ns {
    // TODO

    return nodes;
  }

  removeNode(node: Node): void {
    // TODO
  }

  removeNodes(type: Class<Node>): void {
    // TODO
  }

  addEdge<Type extends Edge>(
    input: AddEdgeInput<Type>
  ): Type {
    const edge = input.edge ?? new Edge();

    // TODO

    return edge as Type;
  }

  removeEdge(input: Edge): void {
    // TODO
  }

  removeEdges(input: RemoveEdgesInput): void {
    // TODO
  }

  setEdgeNodes(edge: Edge, nodes: { from: Node; to: Node }): void {
    // TODO
  }
}

export type AddEdgeInput<E extends Edge> = {
  to: Node;
  from: Node;
  edge?: E;
};

export type RemoveEdgesInput = (
  | { from: Node, to?: Node, type?: Class<Edge> }
  | { from?: Node, to: Node, type?: Class<Edge> }
  | { on: Node, type?: Class<Edge> }
  )

export const DEFAULT_GRAPH = new Graph();
