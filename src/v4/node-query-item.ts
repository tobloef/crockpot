import type { Class } from "./utils/class.ts";
import { Node } from "./node.ts";
import type { Edgelike, Nodelike } from "./query.types.ts";

export class NodeQueryItem<
  ClassType extends Class<Node> = Class<Node>,
  Name extends string = string,
  WithItems extends (Nodelike | Edgelike)[] = [],
  ToItems extends Nodelike[] = [],
  FromItems extends Nodelike[] = [],
> {
  #brand = 'NodeQueryItem' as const;

  class: ClassType;
  name?: Name;
  withItems?: WithItems;
  toItems?: ToItems;
  fromItems?: FromItems;

  constructor(params: {
    class: ClassType,
    name?: Name,
    withItems?: WithItems,
    toItems?: ToItems,
    fromItems?: FromItems,
  }) {
    this.class = params.class;
    this.name = params.name;
    this.withItems = params.withItems;
    this.toItems = params.toItems;
    this.fromItems = params.fromItems;
  }

  as<
    Name extends string
  >(
    name: Name,
  ) {
    return new NodeQueryItem<
      ClassType,
      Name,
      WithItems,
      ToItems,
      FromItems
    >({
      class: this.class,
      name,
      toItems: this.toItems,
      withItems: this.withItems,
      fromItems: this.fromItems,
    });
  }

  with<
    WithItems extends (Nodelike | Edgelike)[]
  >(
    ...items: WithItems
  ) {
    return new NodeQueryItem<
      ClassType,
      Name,
      WithItems,
      ToItems,
      FromItems
    >({
      class: this.class,
      name: this.name,
      toItems: this.toItems,
      withItems: items,
      fromItems: this.fromItems,
    });
  }

  to<
    ToItems extends Nodelike[]
  >(
    ...items: ToItems
  ) {
    return new NodeQueryItem<
      ClassType,
      Name,
      WithItems,
      ToItems,
      FromItems
    >({
      class: this.class,
      name: this.name,
      withItems: this.withItems,
      toItems: items,
      fromItems: this.fromItems,
    });
  }

  from<
    FromItems extends Nodelike[]
  >(
    ...items: FromItems
  ) {
    return new NodeQueryItem<
      ClassType,
      Name,
      WithItems,
      ToItems,
      FromItems
    >({
      class: this.class,
      name: this.name,
      withItems: this.withItems,
      toItems: this.toItems,
      fromItems: items,
    });
  }
}
