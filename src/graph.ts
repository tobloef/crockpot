import { Edge } from "./edge/edge.ts";
import { Node } from "./node/node.ts";
import type {
  ArrayQueryInput,
  ObjectQueryInput,
  QueryInput,
  QueryInputItem,
  QueryOutput,
  QueryOutputItem,
} from "./query/run-query.types.ts";
import {
  type Class,
  getClassHierarchy,
} from "./utils/class.ts";
import {
  GraphQuery,
  type GraphQueryOptions,
} from "./query/graph-query.ts";
import {
  GraphObserver,
  type GraphObserverOptions,
} from "./query/graph-observer.ts";

export class Graph {
  indices = {
    nodesByEdge: new Map<Edge, { from: Node, to: Node }>(),
    edgesByNode: new Map<Node, { from: Set<Edge>, to: Set<Edge> }>(),
    nodesByType: new Map<Class<Node>, Set<Node>>(),
    edgesByType: new Map<Class<Edge>, Set<Edge>>(),
  };

  #itemChangedListeners = new Set<(changelist: Changelist) => void>();

  query<Input extends QueryInputItem>(
    input: Input,
    options?: GraphQueryOptions
  ): GraphQuery<QueryOutput<Input>>;

  query<Input extends ArrayQueryInput>(
    input: [...Input],
    options?: GraphQueryOptions
  ): GraphQuery<QueryOutput<Input>>;

  query<Input extends ObjectQueryInput>(
    input: Input,
    options?: GraphQueryOptions
  ): GraphQuery<QueryOutput<Input>>;

  query<Input extends QueryInput>(
    input: Input,
    options?: GraphQueryOptions
  ): GraphQuery<QueryOutput<Input>> {
    const query = new GraphQuery<
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
  ): GraphObserver<QueryOutput<Input>>;

  observe<Input extends ArrayQueryInput>(
    input: [...Input],
    options?: GraphObserverOptions
  ): GraphObserver<QueryOutput<Input>>;

  observe<Input extends ObjectQueryInput>(
    input: Input,
    options?: GraphObserverOptions
  ): GraphObserver<QueryOutput<Input>>;

  observe<Input extends QueryInput>(
    input: Input,
    options?: GraphObserverOptions
  ): GraphObserver<QueryOutput<Input>> {
    const observer = new GraphObserver<
      QueryOutput<Input>
    >(
      this,
      input,
      options,
    );

    return observer;
  }

  addNode<N extends Node>(node: N): N {
    const changes = this.#newChangelist();

    this.#addNode(node, changes);

    this.#notifyChanges(changes);

    return node;
  }

  addNodes<Nodes extends Node[]>(nodes: Nodes): Nodes {
    const changes = this.#newChangelist();

    for (const node of nodes) {
      this.#addNode(node, changes);
    }

    this.#notifyChanges(changes);

    return nodes;
  }

  #addNode<N extends Node>(
    node: N,
    changes: Changelist,
  ): N {
    const allNodes = this.indices.nodesByType.get(Node);
    if (allNodes?.has(node)) {
      return node;
    }

    changes.added.add(node);

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

        this.#addEdge(
          { edge, from: edge.nodes.from, to: edge.nodes.to },
          changes,
        );
      }

      for (const edge of node.edges.to) {
        if (edge.nodes.to === undefined || edge.nodes.from === undefined) {
          throw new Error(`Edge ${edge.id} is missing from/to nodes.`);
        }

        this.#addEdge(
          { edge, from: edge.nodes.from, to: edge.nodes.to },
          changes,
        );
      }
    }

    if (node.graph !== this) {
      node.graph.#removeNode(node, changes);
      node.graph = this;
    }

    return node;
  }

  removeNode(node: Node): void {
    const changes = this.#newChangelist();

    this.#removeNode(node, changes);

    this.#notifyChanges(changes);
  }

  removeNodes(nodes: Node[]): void {
    const changes = this.#newChangelist();

    for (const node of nodes) {
      this.#removeNode(node, changes);
    }

    this.#notifyChanges(changes);
  }

  removeNodesByType(type: Class<Node>): void {
    const changes = this.#newChangelist();

    for (const [indexType, nodes] of this.indices.nodesByType.entries()) {
      const classHierarchy = getClassHierarchy(indexType);

      if (!classHierarchy.includes(type)) {
        continue;
      }

      for (const node of nodes) {
        this.#removeNode(node, changes);
      }
    }

    this.#notifyChanges(changes);
  }

  #removeNode(
    node: Node,
    changes: Changelist,
  ): void {
    if (!this.indices.nodesByType.get(Node)?.has(node)) {
      return;
    }

    changes.removed.add(node);

    const edgesByNode = this.indices.edgesByNode.get(node);
    if (edgesByNode !== undefined) {
      for (const edge of edgesByNode.from) {
        this.#removeEdge(edge, changes);
      }

      for (const edge of edgesByNode.to) {
        this.#removeEdge(edge, changes);
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
  }

  addEdge<E extends Edge>(
    input: AddEdgeInput<E>
  ): E {
    const changes = this.#newChangelist();

    const edge = this.#addEdge(input, changes);

    this.#notifyChanges(changes);

    return edge;
  }

  #addEdge<E extends Edge>(
    input: AddEdgeInput<E>,
    changes: Changelist,
  ): E {
    const allEdges = this.indices.edgesByType.get(Edge);

    if (
      input.edge !== undefined &&
      allEdges?.has(input.edge)
    ) {
      return input.edge;
    }

    const edge = input.edge ?? new Edge();

    changes.added.add(edge);

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

    this.#addNode(input.from, changes);
    this.#addNode(input.to, changes);

    if (edge.graph !== this) {
      edge.graph.#removeEdge(edge, changes);
      edge.graph = this;
    }

    return edge as E;
  }

  removeEdge(edge: Edge): void {
    const changes = this.#newChangelist();

    this.#removeEdge(edge, changes);

    this.#notifyChanges(changes);
  }

  removeEdges(edges: Edge[]): void {
    const changes = this.#newChangelist();

    for (const edge of edges) {
      this.#removeEdge(edge, changes);
    }

    this.#notifyChanges(changes);
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

    const changes = this.#newChangelist();

    for (const edge of edgesArray) {
      this.#removeEdge(edge, changes);
    }

    this.#notifyChanges(changes);
  }

  removeEdgesByType(type: Class<Edge>): void {
    const changes = this.#newChangelist();

    for (const [indexType, edges] of this.indices.edgesByType.entries()) {
      const classHierarchy = getClassHierarchy(indexType);

      if (!classHierarchy.includes(type)) {
        continue;
      }

      for (const edge of edges) {
        this.#removeEdge(edge, changes);
      }
    }

    this.#notifyChanges(changes);
  }

  #removeEdge(
    edge: Edge,
    changes: Changelist,
  ): void {
    if (!this.indices.edgesByType.get(Edge)?.has(edge)) {
      return;
    }

    changes.removed.add(edge);

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
  }

  onItemsChanged(
    listener: (changelist: Changelist) => void
  ): Unsubscribe {
    this.#itemChangedListeners.add(listener);

    return () => {
      this.#itemChangedListeners.delete(listener);
    };
  }

  #notifyChanges(changes: Changelist): void {
    for (const listener of this.#itemChangedListeners) {
      listener(changes);
    }
  }

  #newChangelist(): Changelist {
    return {
      added: new Set<Node | Edge>(),
      removed: new Set<Node | Edge>(),
    };
  }
}

export type Unsubscribe = () => void;

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

export type Changelist = {
  added: Set<Node | Edge>;
  removed: Set<Node | Edge>;
};