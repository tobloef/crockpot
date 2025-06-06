import { Edge, type EdgeDirection } from "../edge/edge.ts";
import { type Class, type Instance, isClassThatExtends } from "../utils/class.ts";
import type { Edgelike, Nodelike, ReferenceName, } from "../query/run-query.types.ts";
import { randomString } from "../utils/random-string.ts";
import { type Graph } from "../graph.ts";
import {
  NamedNodeQueryItem,
  NodeQueryItem,
  RelatedNodeQueryItem,
} from "./node-query-item.ts";

export class Node {
  #brand = "Node" as const;

  static defaultGraph: Graph;

  readonly id: string = randomString();
  graph: Graph = Node.defaultGraph;

  get edges(): NodeEdges {
    return (
      this.graph.indices.edgesByNode.get(this) ??
      this.#createEmptyEdges()
    );
  }

  static excluding<
    Type extends Class<Node>,
  >(
    this: Type,
    ...excludedClassTypes: Class<Node>[]
  ) {
    return new NodeQueryItem<Type>({
      class: this,
      excludedClassTypes,
    });
  }

  static as<
    Type extends Class<Node>,
    Name extends ReferenceName,
  >(
    this: Type,
    name: Name,
  ) {
    return new NamedNodeQueryItem<Type, Name>({
      class: this,
      name,
    });
  }

  static with<
    Type extends Class<Node>,
    WithItems extends Edgelike[]
  >(
    this: Type,
    ...items: WithItems
  ) {
    return new RelatedNodeQueryItem<Type, WithItems, [], [], []>({
      withItems: items,
      class: this,
    });
  }

  static to<
    Type extends Class<Node>,
    ToItems extends Nodelike[]
  >(
    this: Type,
    ...items: ToItems
  ) {
    return new RelatedNodeQueryItem<Type, [], ToItems, [], []>({
      toItems: items,
      class: this,
    });
  }

  static from<
    Type extends Class<Node>,
    FromItems extends Nodelike[]
  >(
    this: Type,
    ...items: FromItems
  ) {
    return new RelatedNodeQueryItem<Type, [], [], FromItems, []>({
      fromItems: items,
      class: this,
    });
  }

  static fromOrTo<
    Type extends Class<Node>,
    FromOrToItems extends Nodelike[]
  >(
    this: Type,
    ...items: FromOrToItems
  ) {
    return new RelatedNodeQueryItem<Type, [], [], [], FromOrToItems>({
      fromOrToItems: items,
      class: this,
    });
  }

  addEdge<
    Input extends AddEdgeInput
  >(
    input: Input
  ): AddedEdge<Input> {
    if ("to" in input) {
      return this.graph.addEdge({
        from: this,
        to: input.to,
        edge: input.edge,
      });
    } else {
      return this.graph.addEdge({
        from: input.from,
        to: this,
        edge: input.edge,
      });
    }
  }

  removeEdge(edge: Edge): void {
    this.graph.removeEdge(edge);
  }

  removeEdges(input?: RemoveEdgeInput): void {
    if (input !== undefined && "to" in input) {
      this.graph.removeEdgesByNodes({
        from: this,
        to: input.to,
        type: input.type,
      });
    } else if (input !== undefined && "from" in input) {
      this.graph.removeEdgesByNodes({
        from: input.from,
        to: this,
        type: input.type,
      });
    } else {
      this.graph.removeEdgesByNodes({
        fromOrTo: this,
        type: input?.type,
      });
    }
  }

  remove() {
    this.graph.removeNode(this);
  }


  getOneRelated<
    NodeType extends Class<Node> = Class<Node>,
    EdgeType extends Class<Edge> = Class<Edge>
  >(
    edgeType: EdgeType,
    direction: EdgeDirection,
    nodeType: NodeType,
  ): {
    node: Instance<NodeType>,
    edge: Instance<EdgeType>,
  } | {
    node: undefined,
    edge: undefined
  } {
    if (direction === "fromOrTo") {
      return (
        this.getOneRelated(edgeType, "to", nodeType) ??
        this.getOneRelated(edgeType, "from", nodeType)
      );
    }

    const oppositeDirection = direction === "from" ? "to" : "from";

    for (const edge of this.edges[oppositeDirection].values()) {
      if (
        edgeType !== (Edge as Class<Edge>) &&
        !isClassThatExtends(edge.constructor as Class<Edge>, edgeType)
      ) {
        continue;
      }

      const otherNode = edge.nodes[direction];

      if (otherNode === undefined) {
        continue;
      }

      if (
        nodeType !== (Node as Class<Node>) &&
        !isClassThatExtends(otherNode.constructor as Class<Node>, nodeType)
      ) {
        continue;
      }

      return {
        node: otherNode as Instance<NodeType>,
        edge: edge as Instance<EdgeType>,
      }
    }

    return {
      node: undefined,
      edge: undefined,
    };
  }

  *getAllRelated<
    NodeType extends Class<Node> = Class<Node>,
    EdgeType extends Class<Edge> = Class<Edge>
  >(
    edgeType: EdgeType,
    direction: EdgeDirection,
    nodeType: NodeType,
  ): Iterable<{
    node: Instance<NodeType>,
    edge: Instance<EdgeType>,
  }> {
    if (direction === "fromOrTo") {
      yield* this.getAllRelated(edgeType, "from", nodeType);
      yield* this.getAllRelated(edgeType, "to", nodeType);
      return;
    }

    const oppositeDirection = direction === "from" ? "to" : "from";

    for (const edge of this.edges[oppositeDirection].values()) {
      if (
        edgeType !== (Edge as Class<Edge>) &&
        !isClassThatExtends(edge.constructor as Class<Edge>, edgeType)
      ) {
        continue;
      }

      const otherNode = edge.nodes[direction];

      if (otherNode === undefined) {
        continue;
      }

      if (
        nodeType !== (Node as Class<Node>) &&
        !isClassThatExtends(otherNode.constructor as Class<Node>, nodeType)
      ) {
        continue;
      }

      yield {
        node: otherNode as Instance<NodeType>,
        edge: edge as Instance<EdgeType>,
      };
    }
  }

  #createEmptyEdges(): NodeEdges {
    return {
      from: new Set<Edge>(),
      to: new Set<Edge>(),
    };
  }
}

export type AddEdgeInput = (
  | { to: Node, edge?: Edge }
  | { from: Node, edge?: Edge }
);

export type RemoveEdgeInput = (
  | { to: Node, type?: Class<Edge> }
  | { from: Node, type?: Class<Edge> }
  | { type: Class<Edge> }
);

export type NodeEdges = Readonly<{
  from: ReadonlySet<Edge>,
  to: ReadonlySet<Edge>,
}>;

type AddedEdge<Input extends AddEdgeInput> = (
  Input["edge"] extends Edge
    ? Input["edge"]
    : Edge
);
