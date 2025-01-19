import type { Edge } from "./edge.ts";
import type { Class } from "./utils/class.ts";
import { NodeQueryItem } from "./node-query-item.ts";
import type {
  EdgelikeOrReference,
  NodelikeOrReference,
  ReferenceName,
} from "./query.types.ts";
import { randomString } from "./utils/random-string.ts";

export class Node {
  #brand = 'Node' as const;

  id: string = randomString();

  // TODO: Should potentially be a getter that uses the graph and an index behind the scenes
  edges: Edge[] = [];

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
    WithItems extends EdgelikeOrReference[]
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
    ToItems extends NodelikeOrReference[]
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
    FromItems extends NodelikeOrReference[]
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
    FromOrToItems extends NodelikeOrReference[]
  >(
    this: Type,
    ...items: FromOrToItems
  ) {
    return new NodeQueryItem<Type, ReferenceName, [], [], [], FromOrToItems>({
      fromOrToItems: items,
      class: this,
    });
  }

  addEdge(input: NodeEdgeInput): this {
    // TODO
    return this;
  }
}

export type NodeEdgeInput = (
  | { to: Node, edge?: Edge }
  | { from: Node, edge?: Edge }
  | { with: Node, edge?: Edge }
)
