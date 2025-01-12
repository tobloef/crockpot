import type { Class } from "./utils/class.ts";
import { Edge } from "./edge.ts";
import type { Nodelike } from "./query.types.ts";

export type ZeroToTwoNodeLikes = (
  | []
  | [Nodelike]
  | [Nodelike, Nodelike]
);

export class EdgeQueryItem<
  ClassType extends Class<Edge> = Class<Edge>,
  Name extends string = string,
  WithItems extends ZeroToTwoNodeLikes = [],
  ToItem extends Nodelike = Nodelike,
  FromItem extends Nodelike = Nodelike,
  FromOrToItem extends Nodelike = Nodelike,
> {
  #brand = 'EdgeQueryItem' as const;

  class: ClassType;
  name?: Name;
  withItems?: WithItems;
  toItem?: ToItem;
  fromItem?: FromItem;
  fromOrToItem?: FromOrToItem;

  constructor(params: {
    class: ClassType,
    name?: Name,
    withItems?: WithItems,
    toItem?: ToItem,
    fromItem?: FromItem,
    fromOrToItem?: FromOrToItem,
  }) {
    this.class = params.class;
    this.name = params.name;
    this.withItems = params.withItems;
    this.toItem = params.toItem;
    this.fromItem = params.fromItem;
    this.fromOrToItem = params.fromOrToItem;
  }

  as<
    Name extends string
  >(
    name: Name,
  ) {
    return new EdgeQueryItem<
      ClassType,
      Name,
      WithItems,
      ToItem,
      FromItem,
      FromOrToItem
    >({
      class: this.class,
      name,
      withItems: this.withItems,
      toItem: this.toItem,
      fromItem: this.fromItem,
      fromOrToItem: this.fromOrToItem,
    });
  }

  with<
    WithItems extends ZeroToTwoNodeLikes
  >(
    ...items: WithItems
  ) {
    return new EdgeQueryItem<
      ClassType,
      Name,
      WithItems,
      ToItem,
      FromItem,
      FromOrToItem
    >({
      class: this.class,
      name: this.name,
      withItems: items,
      toItem: this.toItem,
      fromItem: this.fromItem,
      fromOrToItem: this.fromOrToItem
    });
  }

  to<
    ToItem extends Nodelike
  >(
    item: ToItem
  ) {
    return new EdgeQueryItem<
      ClassType,
      Name,
      WithItems,
      ToItem,
      FromItem,
      FromOrToItem
    >({
      class: this.class,
      name: this.name,
      withItems: this.withItems,
      toItem: item,
      fromItem: this.fromItem,
      fromOrToItem: this.fromOrToItem
    });
  }

  from<
    FromItem extends Nodelike
  >(
    item: FromItem
  ) {
    return new EdgeQueryItem<
      ClassType,
      Name,
      WithItems,
      ToItem,
      FromItem,
      FromOrToItem
    >({
      class: this.class,
      name: this.name,
      withItems: this.withItems,
      toItem: this.toItem,
      fromItem: item,
      fromOrToItem: this.fromOrToItem,
    });
  }

  fromOrTo<
    FromOrToItem extends Nodelike
  >(
    item: FromOrToItem
  ) {
    return new EdgeQueryItem<
      ClassType,
      Name,
      WithItems,
      ToItem,
      FromOrToItem
    >({
      class: this.class,
      name: this.name,
      withItems: this.withItems,
      toItem: this.toItem,
      fromOrToItem: item,
    });
  }
}
