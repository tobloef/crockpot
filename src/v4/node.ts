import type { Edge } from "./edge.ts";
import type { Class } from "./utils/class.ts";
import { NodeQueryItem } from "./node-query-item.ts";
import type { Edgelike, Nodelike } from "./query.ts";

export class Node {
  #brand = 'Node' as const;

  static as<
    Type extends Class<Node>,
    Name extends string,
  >(
    this: Type,
    name: Name,
  ) {
    return new NodeQueryItem<Type, Name, [], [], []>({
      type: this,
      name,
    });
  }

  static with<
    Type extends Class<Node>,
    WithItems extends (Nodelike | Edgelike)[]
  >(
    this: Type,
    ...items: WithItems
  ): NodeQueryItem<Type, string, WithItems, [], []> {
    return new NodeQueryItem({
      withItems: items,
      type: this,
    });
  }

  static to<
    Type extends Class<Node>,
    ToItems extends (Nodelike | Edgelike)[]
  >(
    this: Type,
    ...items: ToItems
  ) {
    return new NodeQueryItem<Type, string, [], ToItems, []>({
      toItems: items,
      type: this,
    });
  }

  static from<
    Type extends Class<Node>,
    FromItems extends (Nodelike | Edgelike)[]
  >(
    this: Type,
    ...items: FromItems
  ) {
    return new NodeQueryItem<Type, string, [], [], FromItems>({
      fromItems: items,
      type: this,
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
)