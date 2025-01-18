import type { Class } from "./utils/class.ts";
import type { Edgelike, Nodelike } from "./query.types.ts";
import { EdgeQueryItem, type ZeroToTwoNodeLikes } from "./edge-query-item.ts";
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
    Name extends string,
  >(
    this: Type,
    name: Name,
  ) {
    return new EdgeQueryItem<Type, Name>({
      class: this,
      name,
    });
  }

  static with<
    Type extends Class<Edge>,
    WithItems extends ZeroToTwoNodeLikes
  >(
    this: Type,
    ...items: WithItems
  ) {
    return new EdgeQueryItem<Type, string, WithItems>({
      withItems: items,
      class: this,
    });
  }

  static to<
    Type extends Class<Edge>,
    ToItem extends Nodelike
  >(
    this: Type,
    item: ToItem
  ) {
    return new EdgeQueryItem<Type, string, [], ToItem>({
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
    return new EdgeQueryItem<Type, string, [], Nodelike, FromItem>({
      fromItem: item,
      class: this,
    });
  }

  static fromOrTo<
    Type extends Class<Edge>,
    FromOrToItem extends Nodelike
  >(
    this: Type,
    item: FromOrToItem
  ) {
    return new EdgeQueryItem<
      Type,
      string,
      [],
      Nodelike,
      Nodelike,
      FromOrToItem
    >({
      fromOrToItem: item,
      class: this,
    });
  }
}