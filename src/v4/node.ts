import type { Edge } from "./edge.ts";
import type { Class } from "./utils/class.ts";
import { NodeQueryItem } from "./node-query-item.ts";
import type { Edgelike, Nodelike } from "./query.types.ts";
import { randomString } from "./utils/random-string.ts";

export class Node {
  #brand = 'Node' as const;

  id: string = randomString();

  static as<
    Type extends Class<Node>,
    Name extends string,
  >(
    this: Type,
    name: Name,
  ) {
    return new NodeQueryItem<Type, Name, [], [], []>({
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
  ): NodeQueryItem<Type, string, WithItems, [], []> {
    return new NodeQueryItem({
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
    return new NodeQueryItem<Type, string, [], ToItems, []>({
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
    return new NodeQueryItem<Type, string, [], [], FromItems>({
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
    return new NodeQueryItem<Type, string, [], [], [], FromOrToItems>({
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