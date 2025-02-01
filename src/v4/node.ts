import { Edge } from "./edge.ts";
import type { Class } from "./utils/class.ts";
import { NodeQueryItem } from "./node-query-item.ts";
import type {
  Edgelike,
  Nodelike,
  ReferenceName,
} from "./query.types.ts";
import { randomString } from "./utils/random-string.ts";
import { type Graph } from "./graph.ts";

export class Node {
  #brand = 'Node' as const;

  static defaultGraph: Graph;

  id: string = randomString();
  graph: Graph = Node.defaultGraph;

  get edges(): NodeEdges {
    return (
      this.graph.indices.edgesByNode.get(this) ??
      this.#createEmptyEdges()
    );
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

  addEdge<
    Input extends AddEdgeInput
  >(
    input: Input
  ): AddedEdge<Input> {
    if ('to' in input) {
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
    if (input!== undefined && 'to' in input) {
      this.graph.removeEdgesByNodes({
        from: this,
        to: input.to,
        type: input.type,
      });
    } else if (input !== undefined && 'from' in input) {
      this.graph.removeEdgesByNodes({
        from: input.from,
        to: this,
        type: input.type,
      });
    } else {
      this.graph.removeEdgesByNodes({
        on: this,
        type: input?.type,
      });
    }
  }

  remove() {
    this.graph.removeNode(this);
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
)

export type NodeEdges = Readonly<{
  from: ReadonlySet<Edge>,
  to: ReadonlySet<Edge>,
}>;

type AddedEdge<Input extends AddEdgeInput> = (
  Input["edge"] extends Edge
    ? Input["edge"]
    : Edge
);