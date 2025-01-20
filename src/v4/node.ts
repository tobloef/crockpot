import { Edge } from "./edge.ts";
import type { Class } from "./utils/class.ts";
import { NodeQueryItem } from "./node-query-item.ts";
import type {
  Edgelike,
  Nodelike,
  ReferenceName,
} from "./query.types.ts";
import { randomString } from "./utils/random-string.ts";
import type { Graph } from "./graph.ts";
import { writeable } from "./utils/writeable.ts";

export class Node {
  #brand = 'Node' as const;

  id: string = randomString();
  graph?: Readonly<Graph>;

  edges: Readonly<{
    from: Edge[],
    to: Edge[],
  }> = {
    from: [],
    to: [],
  }

  static as<
    Type extends Class<Node>,
    Name extends ReferenceName,
  >(
    this: Type,
    name: Name,
  ) {
    return new NodeQueryItem<Type, Name, [], [], [], []>({
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
    return new NodeQueryItem<Type, ReferenceName, WithItems, [], [], []>({
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
    return new NodeQueryItem<Type, ReferenceName, [], ToItems, [], []>({
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
    return new NodeQueryItem<Type, ReferenceName, [], [], FromItems, []>({
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
    return new NodeQueryItem<Type, ReferenceName, [], [], [], FromOrToItems>({
      fromOrToItems: items,
      class: this,
    });
  }

  addEdge(input: AddEdgeInput): this {
    const edge = input.edge ?? new Edge();

    let toNode: Node;
    let fromNode: Node;

    if ("to" in input) {
      toNode = input.to;
      fromNode = this;
    } else {
      toNode = this;
      fromNode = input.from;
    }

    if (edge.nodes.to !== undefined && edge.nodes.to !== toNode) {
      throw new Error("Edge already has another 'to' node.");
    }

    if (edge.nodes.from !== undefined && edge.nodes.from !== fromNode) {
      throw new Error("Edge already has another 'from' node.");
    }

    writeable(edge.nodes).to = toNode;
    writeable(edge.nodes).from = fromNode;

    if (!toNode.edges.to.includes(edge)) {
      toNode.edges.to.push(edge);
    }

    if (!fromNode.edges.from.includes(edge)) {
      fromNode.edges.from.push(edge);
    }

    return this;
  }

  removeEdges(input: RemoveEdgeInput): this {
    let edges: Edge[];

    if ("to" in input) {
      edges = input.to.edges.to;
    } else {
      edges = input.from.edges.from;
    }

    for (const edge of edges) {
      if (input.type === undefined || edge instanceof input.type) {
        edge.removeFromNodes();
      }
    }

    return this;
  }

  removeAllEdges() {
    for (const edge of this.edges.from) {
      edge.removeFromNodes();
    }

    for (const edge of this.edges.to) {
      edge.removeFromNodes();
    }

    return this;
  }
}

export type AddEdgeInput = (
  | { to: Node, edge?: Edge }
  | { from: Node, edge?: Edge }
);

export type RemoveEdgeInput = (
  | { to: Node, type?: Class<Edge> }
  | { from: Node, type?: Class<Edge> }
)
