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
  FromOrToItems extends Nodelike[] = Nodelike[],
> {
  #brand = 'EdgeQueryItem' as const;

  class: ClassType;
  name?: Name;
  toItem?: ToItem;
  fromItem?: FromItem;
  fromOrToItems?: FromOrToItems;

  constructor(params: {
    class: ClassType,
    name?: Name,
    toItem?: ToItem,
    fromItem?: FromItem,
    fromOrToItems?: FromOrToItems,
  }) {
    this.class = params.class;
    this.name = params.name;
    this.toItem = params.toItem;
    this.fromItem = params.fromItem;
    this.fromOrToItems = params.fromOrToItems;
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
      FromOrToItems
    >({
      class: this.class,
      name,
      toItem: this.toItem,
      fromItem: this.fromItem,
      fromOrToItems: this.fromOrToItems,
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
      FromOrToItems
    >({
      class: this.class,
      name: this.name,
      toItem: item,
      fromItem: this.fromItem,
      fromOrToItems: this.fromOrToItems
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
      FromOrToItems
    >({
      class: this.class,
      name: this.name,
      toItem: this.toItem,
      fromItem: item,
      fromOrToItems: this.fromOrToItems,
    });
  }

  fromOrTo<
    FromOrToItems extends Nodelike[]
  >(
    ...items: FromOrToItems
  ) {
    if (items.length > 2) {
      throw new Error(`The 'fromOrTo' parameter can only accept up to 2 items, but ${items.length} were given.`);
    }

    return new EdgeQueryItem<
      ClassType,
      Name,
      ToItem,
      FromItem,
      FromOrToItems
    >({
      class: this.class,
      name: this.name,
      toItem: this.toItem,
      fromOrToItems: items,
    });
  }
}
