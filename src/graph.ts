import { Edge } from "./edge/edge.ts";
import { Node } from "./node/node.ts";
import type { ArrayQueryInput, ObjectQueryInput, QueryInput, QueryInputItem, QueryOutput, QueryOutputItem, } from "./query/query.types.ts";
import { query } from "./query/query.ts";
import type { Class } from "./utils/class.ts";

export class Graph {
  indices = {
    allNodes: new Set<Node>(),
    allEdges: new Set<Edge>(),
    nodesByEdge: new Map<Edge, { from: Node, to: Node }>(),
    edgesByNode: new Map<Node, { from: Set<Edge>, to: Set<Edge> }>(),
    nodesByType: new Map<Class<Node>, Set<Node>>(),
    edgesByType: new Map<Class<Edge>, Set<Edge>>(),
  };

  query<Input extends QueryInputItem>(input: Input): Generator<QueryOutput<Input>>;

  query<Input extends ArrayQueryInput>(input: [...Input]): Generator<QueryOutput<Input>>;

  query<Input extends ObjectQueryInput>(input: Input): Generator<(
    // Type duplicated from ObjectQueryOutput to fix type hints.
    // If ObjectQueryOutput or QueryOutput is used directly, it shows up as:
    // Generator<ObjectQueryOutput<
    //   { Transform: typeof Transform },
    //   { Transform: typeof Transform }
    // >, any, any>
    { [K in keyof Input]: QueryOutputItem<Input[K], Input> }
    )>;

  query<Input extends QueryInput>(input: Input): Generator<QueryOutput<Input>> {
    return query(this, input);
  }

  addNode<N extends Node>(node: N): N {
    if (this.indices.allNodes.has(node)) {
      return node;
    }

    this.indices.allNodes.add(node);

    const type = node.constructor as Class<Node>;

    let nodesByType = this.indices.nodesByType.get(type);
    if (nodesByType === undefined) {
      nodesByType = new Set();
      this.indices.nodesByType.set(type, nodesByType);
    }

    nodesByType.add(node);

    const hasEdges = node.edges.from.size > 0 || node.edges.to.size > 0;

    if (hasEdges) {
      for (const edge of node.edges.from) {
        if (edge.nodes.to === undefined || edge.nodes.from === undefined) {
          throw new Error(`Edge ${edge.id} is missing from/to nodes.`);
        }

        this.addEdge({ edge, from: edge.nodes.from, to: edge.nodes.to });
      }

      for (const edge of node.edges.to) {
        if (edge.nodes.to === undefined || edge.nodes.from === undefined) {
          throw new Error(`Edge ${edge.id} is missing from/to nodes.`);
        }

        this.addEdge({ edge, from: edge.nodes.from, to: edge.nodes.to });
      }
    }

    if (node.graph !== this) {
      node.graph.removeNode(node);
      node.graph = this;
    }

    return node;
  }

  addNodes<Nodes extends Node[]>(nodes: Nodes): Nodes {
    return nodes.map((n) => this.addNode(n)) as Nodes;
  }

  removeNode(node: Node): void {
    this.indices.allNodes.delete(node);

    const edgesByNode = this.indices.edgesByNode.get(node);
    if (edgesByNode !== undefined) {
      for (const edge of edgesByNode.from) {
        this.removeEdge(edge);
      }

      for (const edge of edgesByNode.to) {
        this.removeEdge(edge);
      }

      this.indices.edgesByNode.delete(node);
    }

    const type = node.constructor as Class<Node>;

    const nodesByType = this.indices.nodesByType.get(type);
    if (nodesByType !== undefined) {
      nodesByType.delete(node);
    }
  }

  removeNodes(nodes: Node[]): void {
    for (const node of nodes) {
      this.removeNode(node);
    }
  }

  removeNodesByType(type: Class<Node>): void {
    const nodes = this.indices.nodesByType.get(type);
    if (nodes === undefined) {
      return;
    }

    this.removeNodes(Array.from(nodes));
  }

  addEdge<E extends Edge>(
    input: AddEdgeInput<E>
  ): E {
    if (
      input.edge !== undefined &&
      this.indices.allEdges.has(input.edge)
    ) {
      return input.edge;
    }

    const edge = input.edge ?? new Edge();

    this.indices.allEdges.add(edge);

    const type = edge.constructor as Class<Edge>;

    let edgesByType = this.indices.edgesByType.get(type);
    if (edgesByType === undefined) {
      edgesByType = new Set();
      this.indices.edgesByType.set(type, edgesByType);
    }

    edgesByType.add(edge);

    let nodesByEdge = this.indices.nodesByEdge.get(edge);
    if (nodesByEdge === undefined) {
      nodesByEdge = {
        from: input.from,
        to: input.to,
      };
      this.indices.nodesByEdge.set(edge, nodesByEdge);
    }

    nodesByEdge.from = input.from;
    nodesByEdge.to = input.to;

    let edgesByFromNode = this.indices.edgesByNode.get(input.from);
    if (edgesByFromNode === undefined) {
      edgesByFromNode = {
        from: new Set(),
        to: new Set(),
      };
      this.indices.edgesByNode.set(input.from, edgesByFromNode);
    }

    let edgesByToNode = this.indices.edgesByNode.get(input.to);
    if (edgesByToNode === undefined) {
      edgesByToNode = {
        from: new Set(),
        to: new Set(),
      };
      this.indices.edgesByNode.set(input.to, edgesByToNode);
    }

    edgesByFromNode.from.add(edge);
    edgesByToNode.to.add(edge);

    this.addNode(input.from);
    this.addNode(input.to);

    if (edge.graph !== this) {
      edge.graph.removeEdge(edge);
      edge.graph = this;
    }

    return edge as E;
  }

  removeEdge(edge: Edge): void {
    this.indices.allEdges.delete(edge);

    const nodesByEdge = this.indices.nodesByEdge.get(edge);
    if (nodesByEdge !== undefined) {
      this.indices.edgesByNode.get(nodesByEdge.from)?.from.delete(edge);
      this.indices.edgesByNode.get(nodesByEdge.to)?.to.delete(edge);
      this.indices.nodesByEdge.delete(edge);
    }

    const type = edge.constructor as Class<Edge>;

    const edgesByType = this.indices.edgesByType.get(type);
    if (edgesByType !== undefined) {
      edgesByType.delete(edge);
    }
  }

  removeEdges(edges: Edge[]): void {
    for (const edge of edges) {
      this.removeEdge(edge);
    }
  }

  removeEdgesByNodes(input: RemoveEdgesInput): void {
    let edgesSet: Set<Edge> | undefined;

    if ("fromOrTo" in input) {
      const edgesByNode = this.indices.edgesByNode.get(input.fromOrTo);

      if (edgesByNode?.from !== undefined && edgesByNode.to !== undefined) {
        edgesSet = edgesByNode.from.union(edgesByNode.to);
      } else {
        edgesSet = edgesByNode?.from ?? edgesByNode?.to;
      }
    } else {
      let fromEdges: Set<Edge> | undefined;
      let toEdges: Set<Edge> | undefined;

      if (input.from !== undefined) {
        fromEdges = this.indices.edgesByNode.get(input.from)?.from;
      }

      if (input.to !== undefined) {
        toEdges = this.indices.edgesByNode.get(input.to)?.to;
      }

      if (fromEdges !== undefined && toEdges !== undefined) {
        edgesSet = fromEdges.intersection(toEdges);
      } else {
        edgesSet = fromEdges ?? toEdges;
      }
    }

    if (edgesSet === undefined) {
      return;
    }

    let edgesArray = Array.from(edgesSet);

    if (input.type !== undefined) {
      const type = input.type; // For type narrowing inside the filter function
      edgesArray = edgesArray.filter((edge) => edge instanceof type);
    }

    for (const edge of edgesArray) {
      this.removeEdge(edge);
    }
  }

  removeEdgesByType(type: Class<Edge>): void {
    const nodes = this.indices.edgesByType.get(type);
    if (nodes === undefined) {
      return;
    }

    this.removeEdges(Array.from(nodes));
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
  | { fromOrTo: Node, type?: Class<Edge> }
);

export const defaultGraph = new Graph();
Node.defaultGraph = defaultGraph;
Edge.defaultGraph = defaultGraph;
