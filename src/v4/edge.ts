import type { Class } from "./utils/class.ts";
import type {
  Nodelike,
  ReferenceName,
} from "./query.types.ts";
import { EdgeQueryItem } from "./edge-query-item.ts";
import { randomString } from "./utils/random-string.ts";
import type { Node } from "./node.ts";

export class Edge {
  #brand = 'Edge' as const;

  id: string = randomString();

  // TODO: Should potentially be a getter that uses the graph and an index behind the scenes
  nodes: {
    from?: Node,
    to?: Node,
  } = {};

  static as<
    Type extends Class<Edge>,
    Name extends ReferenceName,
  >(
    this: Type,
    name: Name,
  ) {
    return new EdgeQueryItem<
      Type,
      Name,
      Nodelike,
      Nodelike,
      Nodelike[]
    >({
      class: this,
      name,
    });
  }

  static to<
    Type extends Class<Edge>,
    ToItem extends Nodelike
  >(
    this: Type,
    item: ToItem
  ) {
    return new EdgeQueryItem<
      Type,
      ReferenceName,
      ToItem,
      Nodelike,
      Nodelike[]
    >({
      toItem: item,
      class: this,
    });
  }

  static from<
    Type extends Class<Edge>,
    FromItem extends Nodelike
  >(
    this: Type,
    item: FromItem
  ) {
    return new EdgeQueryItem<
      Type,
      ReferenceName,
      Nodelike,
      FromItem,
      Nodelike[]
    >({
      fromItem: item,
      class: this,
    });
  }

  static fromOrTo<
    Type extends Class<Edge>,
    FromOrToItems extends Nodelike[]
  >(
    this: Type,
    ...items: FromOrToItems
  ) {
    return new EdgeQueryItem<
      Type,
      ReferenceName,
      Nodelike,
      Nodelike,
      FromOrToItems
    >({
      fromOrToItems: items,
      class: this,
    });
  }
}
