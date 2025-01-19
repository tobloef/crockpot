import type { Class } from "./utils/class.ts";
import type {
  NodelikeOrReference,
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
      NodelikeOrReference,
      NodelikeOrReference,
      NodelikeOrReference
    >({
      class: this,
      name,
    });
  }

  static to<
    Type extends Class<Edge>,
    ToItem extends NodelikeOrReference
  >(
    this: Type,
    item: ToItem
  ) {
    return new EdgeQueryItem<
      Type,
      ReferenceName,
      ToItem,
      NodelikeOrReference,
      NodelikeOrReference
    >({
      toItem: item,
      class: this,
    });
  }

  static from<
    Type extends Class<Edge>,
    FromItem extends NodelikeOrReference
  >(
    this: Type,
    item: FromItem
  ) {
    return new EdgeQueryItem<
      Type,
      ReferenceName,
      NodelikeOrReference,
      FromItem,
      NodelikeOrReference
    >({
      fromItem: item,
      class: this,
    });
  }

  static fromOrTo<
    Type extends Class<Edge>,
    FromOrToItem extends NodelikeOrReference
  >(
    this: Type,
    item: FromOrToItem
  ) {
    return new EdgeQueryItem<
      Type,
      ReferenceName,
      NodelikeOrReference,
      NodelikeOrReference,
      FromOrToItem
    >({
      fromOrToItem: item,
      class: this,
    });
  }
}
