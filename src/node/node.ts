import {
  Edge,
  type EdgeDirection,
} from "../edge/edge.ts";
import {
  type Class,
  type Instance,
  isClassThatExtends,
} from "../utils/class.ts";
import type {
  Edgelike,
  Nodelike,
  ReferenceName,
} from "../query/run-query.types.ts";
import { randomString } from "../utils/random-string.ts";
import { type Graph } from "../graph.ts";
import { NodeQueryItem } from "./node-query-item.ts";
import { DEFAULT_OPTIONALITY_KEY } from "../query/optional.js";

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

  static except<
    Type extends Class<Node>,
  >(
    this: Type,
    ...excludedClassTypes: Class<Node>[]
  ) {
    return new NodeQueryItem<
      Type,
      ReferenceName,
      Edgelike[],
      Nodelike[],
      Nodelike[],
      Nodelike[],
      boolean
    >({
      class: this,
      excludedClassTypes,
    });
  }

  static optional<
    Type extends Class<Node>,
  >(
    this: Type,
    optionalityGroup: string = DEFAULT_OPTIONALITY_KEY,
  ) {
    return new NodeQueryItem<
      Type,
      ReferenceName,
      Edgelike[],
      Nodelike[],
      Nodelike[],
      Nodelike[],
      true
    >({
      class: this,
      optionalityKey: optionalityGroup,
    });
  }

  static as<
    Type extends Class<Node>,
    Name extends ReferenceName,
  >(
    this: Type,
    name: Name,
  ) {
    return new NodeQueryItem<
      Type,
      Name,
      Edgelike[],
      Nodelike[],
      Nodelike[],
      Nodelike[],
      boolean
    >({
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
    return new NodeQueryItem<
      Type,
      ReferenceName,
      WithItems,
      Nodelike[],
      Nodelike[],
      Nodelike[],
      boolean
    >({
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
    return new NodeQueryItem<
      Type,
      ReferenceName,
      Edgelike[],
      ToItems,
      Nodelike[],
      Nodelike[],
      boolean
    >({
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
    return new NodeQueryItem<
      Type,
      ReferenceName,
      Edgelike[],
      Nodelike[],
      FromItems,
      Nodelike[],
      boolean
    >({
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
    return new NodeQueryItem<
      Type,
      ReferenceName,
      Edgelike[],
      Nodelike[],
      Nodelike[],
      FromOrToItems,
      boolean
    >({
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
    input?: {
      nodeType?: NodeType,
      direction?: EdgeDirection,
      edgeType?: EdgeType,
    }
  ): {
    node: Instance<NodeType>,
    edge: Instance<EdgeType>,
  } | undefined {
    const { nodeType, direction, edgeType } = input ?? {};

    if (direction === undefined || direction === "fromOrTo") {
      return (
        this.getOneRelated({ nodeType, edgeType, direction: "from" }) ??
        this.getOneRelated({ nodeType, edgeType, direction: "to" })
      );
    }

    const oppositeDirection = direction === "from" ? "to" : "from";

    for (const edge of this.edges[direction].values()) {
      if (
        edgeType !== undefined &&
        !isClassThatExtends(edge.constructor as Class<Edge>, edgeType)
      ) {
        continue;
      }

      const otherNode = edge.nodes[oppositeDirection];

      if (otherNode === undefined) {
        continue;
      }

      if (
        nodeType !== undefined &&
        !isClassThatExtends(otherNode.constructor as Class<Node>, nodeType)
      ) {
        continue;
      }

      return {
        node: otherNode as Instance<NodeType>,
        edge: edge as Instance<EdgeType>,
      }
    }
  }

  *getAllRelated<
    NodeType extends Class<Node> = Class<Node>,
    EdgeType extends Class<Edge> = Class<Edge>
  >(
    input?: {
      nodeType?: NodeType,
      direction?: EdgeDirection,
      edgeType?: EdgeType,
    }
  ): Iterable<{
    node: Instance<NodeType>,
    edge: Instance<EdgeType>,
  }> {
    const { nodeType, direction, edgeType } = input ?? {};

    if (direction === undefined || direction === "fromOrTo") {
      yield* this.getAllRelated({ nodeType, edgeType, direction: "from" });
      yield* this.getAllRelated({ nodeType, edgeType, direction: "to" });
      return;
    }

    const oppositeDirection = direction === "from" ? "to" : "from";

    for (const edge of this.edges[direction].values()) {
      if (
        edgeType !== undefined &&
        !isClassThatExtends(edge.constructor as Class<Edge>, edgeType)
      ) {
        continue;
      }

      const otherNode = edge.nodes[oppositeDirection];

      if (otherNode === undefined) {
        continue;
      }

      if (
        nodeType !== undefined &&
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
