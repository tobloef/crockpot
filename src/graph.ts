import { Edge } from "./edge/edge.ts";
import { Node } from "./node/node.ts";
import type { ArrayQueryInput, ObjectQueryInput, QueryInput, QueryInputItem, QueryOutput, QueryOutputItem, } from "./query/run-query.types.ts";
import { type Class, getClassHierarchy } from "./utils/class.ts";
import { GraphQuery, type GraphQueryOptions } from "./query/graph-query.js";
import { GraphObserver, type GraphObserverOptions } from "./query/graph-observer.js";

export class Graph {
  indices = {
    nodesByEdge: new Map<Edge, { from: Node, to: Node }>(),
    edgesByNode: new Map<Node, { from: Set<Edge>, to: Set<Edge> }>(),
    nodesByType: new Map<Class<Node>, Set<Node>>(),
    edgesByType: new Map<Class<Edge>, Set<Edge>>(),
  };

  #notifiables = new Set<Notifiable>();

  query<Input extends QueryInputItem>(
    input: Input,
    options?: GraphQueryOptions
  ): GraphQuery<Input, QueryOutput<Input>>;

  query<Input extends ArrayQueryInput>(
    input: [...Input],
    options?: GraphQueryOptions
  ): GraphQuery<Input, QueryOutput<Input>>;

  query<Input extends ObjectQueryInput>(
    input: Input,
    options?: GraphQueryOptions
  ): GraphQuery<Input, (
    // Type duplicated from ObjectQueryOutput to fix type hints.
    // If ObjectQueryOutput or QueryOutput is used directly, it shows up as:
    // Generator<ObjectQueryOutput<
    //   { Transform: typeof Transform },
    //   { Transform: typeof Transform }
    // >, any, any>
    { [K in keyof Input]: QueryOutputItem<Input[K], Input> }
  )>;

  query<Input extends QueryInput>(
    input: Input,
    options?: GraphQueryOptions
  ): GraphQuery<Input, QueryOutput<Input>> {
    const query = new GraphQuery<
      Input,
      QueryOutput<Input>
    >(
      this,
      input,
      options,
    );

    return query;
  }

  observe<Input extends QueryInputItem>(
    input: Input,
    options?: GraphObserverOptions
  ): GraphObserver<Input, QueryOutput<Input>>;

  observe<Input extends ArrayQueryInput>(
    input: [...Input],
    options?: GraphObserverOptions
  ): GraphObserver<Input, QueryOutput<Input>>;

  observe<Input extends ObjectQueryInput>(
    input: Input,
    options?: GraphObserverOptions
  ): GraphObserver<Input, (
    // Type duplicated from ObjectQueryOutput to fix type hints.
    // If ObjectQueryOutput or QueryOutput is used directly, it shows up as:
    // Generator<ObjectQueryOutput<
    //   { Transform: typeof Transform },
    //   { Transform: typeof Transform }
    // >, any, any>
    { [K in keyof Input]: QueryOutputItem<Input[K], Input> }
    )>;

  observe<Input extends QueryInput>(
    input: Input,
    options?: GraphObserverOptions
  ): GraphObserver<Input, QueryOutput<Input>> {
    const observer = new GraphObserver<
      Input,
      QueryOutput<Input>
    >(
      this,
      input,
      options,
    );

    return observer;
  }

  addNode<N extends Node>(node: N): N {
    const allNodes = this.indices.nodesByType.get(Node);
    if (allNodes?.has(node)) {
      return node;
    }

    const types = getClassHierarchy(node.constructor as Class<Node>);

    for (const type of types) {
      let nodesByType = this.indices.nodesByType.get(type);

      if (nodesByType === undefined) {
        nodesByType = new Set();
        this.indices.nodesByType.set(type, nodesByType);
      }

      nodesByType.add(node);
    }

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

    for (const query of this.#notifiables) {
      query.notifyAdded(node);
    }

    return node;
  }

  addNodes<Nodes extends Node[]>(nodes: Nodes): Nodes {
    return nodes.map((n) => this.addNode(n)) as Nodes;
  }

  removeNode(node: Node): void {
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

    const types = getClassHierarchy(node.constructor as Class<Node>);

    for (const type of types) {
      const nodesByType = this.indices.nodesByType.get(type);

      if (nodesByType !== undefined) {
        nodesByType.delete(node);
      }
    }

    for (const query of this.#notifiables) {
      query.notifyRemoved(node);
    }
  }

  removeNodes(nodes: Node[]): void {
    for (const node of nodes) {
      this.removeNode(node);
    }
  }

  removeNodesByType(type: Class<Node>): void {
    for (const [indexType, nodes] of this.indices.nodesByType.entries()) {
      const classHierarchy = getClassHierarchy(indexType);

      if (!classHierarchy.includes(type)) {
        continue;
      }

      for (const node of nodes) {
        this.removeNode(node);
      }
    }
  }

  addEdge<E extends Edge>(
    input: AddEdgeInput<E>
  ): E {
    const allEdges = this.indices.edgesByType.get(Edge);

    if (
      input.edge !== undefined &&
      allEdges?.has(input.edge)
    ) {
      return input.edge;
    }

    const edge = input.edge ?? new Edge();

    const types = getClassHierarchy(edge.constructor as Class<Edge>);

    for (const type of types) {
      let edgesByType = this.indices.edgesByType.get(type);

      if (edgesByType === undefined) {
        edgesByType = new Set();
        this.indices.edgesByType.set(type, edgesByType);
      }

      edgesByType.add(edge);
    }

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

    for (const query of this.#notifiables) {
      query.notifyAdded(edge);
    }

    return edge as E;
  }

  removeEdge(edge: Edge): void {
    const nodesByEdge = this.indices.nodesByEdge.get(edge);

    if (nodesByEdge !== undefined) {
      this.indices.edgesByNode.get(nodesByEdge.from)?.from.delete(edge);
      this.indices.edgesByNode.get(nodesByEdge.to)?.to.delete(edge);
      this.indices.nodesByEdge.delete(edge);
    }

    const types = getClassHierarchy(edge.constructor as Class<Edge>);

    for (const type of types) {
      const edgesByType = this.indices.edgesByType.get(type);

      if (edgesByType !== undefined) {
        edgesByType.delete(edge);
      }
    }

    for (const query of this.#notifiables) {
      query.notifyRemoved(edge);
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
    for (const [indexType, edges] of this.indices.edgesByType.entries()) {
      const classHierarchy = getClassHierarchy(indexType);

      if (!classHierarchy.includes(type)) {
        continue;
      }

      for (const edge of edges) {
        this.removeEdge(edge);
      }
    }
  }

  subscribeToNotifications(notifiable: Notifiable): void {
    this.#notifiables.add(notifiable);
  }

  unsubscribeFromNotifications(notifiable: Notifiable): void {
    this.#notifiables.delete(notifiable);
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

export type Notifiable = {
  notifyAdded(item: Node | Edge): void;
  notifyRemoved(item: Node | Edge): void;
}