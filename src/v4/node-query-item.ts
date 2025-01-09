import type { Class } from "./utils/class.ts";
import { Node } from "./node.ts";
import type { Edgelike, Nodelike } from "./query.ts";

export class NodeQueryItem<
  Type extends Class<Node>,
  Name extends string
> {
  type: Type;
  name?: Name;
  withItems?: (Nodelike | Edgelike)[];
  toItems?: (Nodelike | Edgelike)[];
  fromItems?: (Nodelike | Edgelike)[];

  constructor(params: {
    type: Type,
    name?: Name,
    withItems?: (Nodelike | Edgelike)[],
    toItems?: (Nodelike | Edgelike)[],
    fromItems?: (Nodelike | Edgelike)[],
  }) {
    this.type = params.type;
    this.name = params.name;
    this.withItems = params.withItems;
    this.toItems = params.toItems;
    this.fromItems = params.fromItems;
  }

  as<Name extends string>(
    name: Name,
  ): NodeQueryItem<Type, Name> {
    return new NodeQueryItem<Type, Name>({
      type: this.type,
      name,
      toItems: this.toItems,
      withItems: this.withItems,
      fromItems: this.fromItems,
    });
  }

  with(
    ...items: (Nodelike | Edgelike)[]
  ): NodeQueryItem<Type, string> {
    return new NodeQueryItem({
      type: this.type,
      name: this.name,
      toItems: this.toItems,
      withItems: items,
      fromItems: this.fromItems,
    });
  }

  to(
    ...items: (Nodelike | Edgelike)[]
  ): NodeQueryItem<Type, string> {
    return new NodeQueryItem({
      type: this.type,
      name: this.name,
      withItems: this.withItems,
      toItems: items,
      fromItems: this.fromItems,
    });
  }

  from(
    ...items: (Nodelike | Edgelike)[]
  ): NodeQueryItem<Type, string> {
    return new NodeQueryItem({
      type: this.type,
      name: this.name,
      withItems: this.withItems,
      toItems: this.toItems,
      fromItems: items,
    });
  }
}
