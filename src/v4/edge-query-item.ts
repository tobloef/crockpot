import type { Class } from "./utils/class.ts";
import { Edge } from "./edge.ts";
import type {
  Nodelike,
  ReferenceName,
} from "./query.types.ts";

export class EdgeQueryItem<
  ClassType extends Class<Edge> = Class<Edge>,
  Name extends string = ReferenceName,
  ToItem extends Nodelike = Nodelike,
  FromItem extends Nodelike = Nodelike,
  FromOrToItem extends Nodelike = Nodelike,
> {
  #brand = 'EdgeQueryItem' as const;

  class: ClassType;
  name?: Name;
  toItem?: ToItem;
  fromItem?: FromItem;
  fromOrToItem?: FromOrToItem;

  constructor(params: {
    class: ClassType,
    name?: Name,
    toItem?: ToItem,
    fromItem?: FromItem,
    fromOrToItem?: FromOrToItem,
  }) {
    this.class = params.class;
    this.name = params.name;
    this.toItem = params.toItem;
    this.fromItem = params.fromItem;
    this.fromOrToItem = params.fromOrToItem;
  }

  as<
    Name extends ReferenceName
  >(
    name: Name,
  ) {
    return new EdgeQueryItem<
      ClassType,
      Name,
      ToItem,
      FromItem,
      FromOrToItem
    >({
      class: this.class,
      name,
      toItem: this.toItem,
      fromItem: this.fromItem,
      fromOrToItem: this.fromOrToItem,
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
      ToItem,
      FromItem,
      FromOrToItem
    >({
      class: this.class,
      name: this.name,
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
      ToItem,
      FromItem,
      FromOrToItem
    >({
      class: this.class,
      name: this.name,
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
      ToItem,
      FromOrToItem
    >({
      class: this.class,
      name: this.name,
      toItem: this.toItem,
      fromOrToItem: item,
    });
  }
}
