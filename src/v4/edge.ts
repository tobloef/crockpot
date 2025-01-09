import type { Class } from "./utils/class.ts";
import type { Nodelike } from "./query.ts";
import { EdgeQueryItem } from "./edge-query-item.ts";

export class Edge {
  #brand = 'Edge' as const;

  static as<
    Type extends Class<Edge>,
    Name extends string,
  >(
    this: Type,
    name: Name,
  ): EdgeQueryItem<Type, Name> {
    return new EdgeQueryItem<Type, Name>({
      type: this,
      name,
    });
  }

  static with<
    Type extends Class<Edge>
  >(
    this: Type,
    ...items: Nodelike[]
  ): EdgeQueryItem<Type, string> {
    return new EdgeQueryItem({
      withItems: items,
      type: this,
    });
  }

  static to<
    Type extends Class<Edge>
  >(
    this: Type,
    ...items: Nodelike[]
  ): EdgeQueryItem<Type, string> {
    return new EdgeQueryItem({
      toItems: items,
      type: this,
    });
  }

  static from<
    Type extends Class<Edge>
  >(
    this: Type,
    ...items: Nodelike[]
  ): EdgeQueryItem<Type, string> {
    return new EdgeQueryItem({
      fromItems: items,
      type: this,
    });
  }
}