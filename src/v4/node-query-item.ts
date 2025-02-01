import type { Class } from "./utils/class.ts";
import { Node } from "./node.ts";
import type { Edgelike, Nodelike, ReferenceName, } from "./query/query.types.ts";

export class NodeQueryItem<
  ClassType extends Class<Node> = Class<Node>,
  Name extends ReferenceName = ReferenceName,
  WithItems extends Edgelike[] = Edgelike[],
  ToItems extends Nodelike[] = Nodelike[],
  FromItems extends Nodelike[] = Nodelike[],
  FromOrToItems extends Nodelike[] = Nodelike[],
> {
  #brand = 'NodeQueryItem' as const;

  class: ClassType;
  name?: Name;
  withItems?: WithItems;
  toItems?: ToItems;
  fromItems?: FromItems;
  fromOrToItems?: FromOrToItems;

  constructor(params: {
    class: ClassType,
    name?: Name,
    withItems?: WithItems,
    toItems?: ToItems,
    fromItems?: FromItems,
    fromOrToItems?: FromOrToItems,
  }) {
    this.class = params.class;
    this.name = params.name;
    this.withItems = params.withItems;
    this.toItems = params.toItems;
    this.fromItems = params.fromItems;
    this.fromOrToItems = params.fromOrToItems;
  }

  as<
    Name extends ReferenceName
  >(
    name: Name,
  ) {
    return new NodeQueryItem<
      ClassType,
      Name,
      WithItems,
      ToItems,
      FromItems,
      FromOrToItems
    >({
      class: this.class,
      name,
      toItems: this.toItems,
      withItems: this.withItems,
      fromItems: this.fromItems,
      fromOrToItems: this.fromOrToItems,
    });
  }

  with<
    WithItems extends Edgelike[]
  >(
    ...items: WithItems
  ) {
    return new NodeQueryItem<
      ClassType,
      Name,
      WithItems,
      ToItems,
      FromItems,
      FromOrToItems
    >({
      class: this.class,
      name: this.name,
      toItems: this.toItems,
      withItems: items,
      fromItems: this.fromItems,
      fromOrToItems: this.fromOrToItems,
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
      FromItems,
      FromOrToItems
    >({
      class: this.class,
      name: this.name,
      withItems: this.withItems,
      toItems: items,
      fromItems: this.fromItems,
      fromOrToItems: this.fromOrToItems,
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
      FromItems,
      FromOrToItems
    >({
      class: this.class,
      name: this.name,
      withItems: this.withItems,
      toItems: this.toItems,
      fromItems: items,
      fromOrToItems: this.fromOrToItems,
    });
  }

  fromOrTo<
    FromOrToItems extends Nodelike[]
  >(
    ...items: FromOrToItems
  ) {
    return new NodeQueryItem<
      ClassType,
      Name,
      WithItems,
      ToItems,
      FromItems,
      FromOrToItems
    >({
      class: this.class,
      name: this.name,
      withItems: this.withItems,
      toItems: this.toItems,
      fromItems: this.fromItems,
      fromOrToItems: items,
    });
  }
}
