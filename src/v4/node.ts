import type { Edge } from "./edge.ts";
import type { Class } from "./utils/class.ts";
import { NodeQueryItem } from "./node-query-item.ts";
import type { Edgelike, Nodelike } from "./query.ts";

export class Node {
  static as<
    Type extends Class<Node>,
    Name extends string,
  >(
    this: Type,
    name: Name,
  ): NodeQueryItem<Type, Name> {
    return new NodeQueryItem<Type, Name>({
      type: this,
      name,
    });
  }

  static with<
    Type extends Class<Node>
  >(
    this: Type,
    ...items: (Nodelike | Edgelike)[]
  ): NodeQueryItem<Type, string> {
    return new NodeQueryItem({
      withItems: items,
      type: this,
    });
  }

  static to<
    Type extends Class<Node>
  >(
    this: Type,
    ...items: (Nodelike | Edgelike)[]
  ): NodeQueryItem<Type, string> {
    return new NodeQueryItem({
      toItems: items,
      type: this,
    });
  }

  static from<
    Type extends Class<Node>
  >(
    this: Type,
    ...items: (Nodelike | Edgelike)[]
  ): NodeQueryItem<Type, string> {
    return new NodeQueryItem({
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