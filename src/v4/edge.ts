import type { Class } from "./utils/class.ts";
import type { Edgelike, Nodelike } from "./query.types.ts";
import { EdgeQueryItem } from "./edge-query-item.ts";
import { randomString } from "./utils/random-string.ts";

export class Edge {
  #brand = 'Edge' as const;

  id: string = randomString();

  static as<
    Type extends Class<Edge>,
    Name extends string,
  >(
    this: Type,
    name: Name,
  ) {
    return new EdgeQueryItem<Type, Name, [], [], []>({
      class: this,
      name,
    });
  }

  static with<
    Type extends Class<Edge>,
    WithItems extends Nodelike[]
  >(
    this: Type,
    ...items: WithItems
  ) {
    return new EdgeQueryItem<Type, string, WithItems, [], []>({
      withItems: items,
      class: this,
    });
  }

  static to<
    Type extends Class<Edge>,
    ToItems extends Nodelike[]
  >(
    this: Type,
    ...items: ToItems
  ) {
    return new EdgeQueryItem<Type, string, [], ToItems, []>({
      toItems: items,
      class: this,
    });
  }

  static from<
    Type extends Class<Edge>,
    FromItems extends Nodelike[]
  >(
    this: Type,
    ...items: FromItems
  ) {
    return new EdgeQueryItem<Type, string, [], [], FromItems>({
      fromItems: items,
      class: this,
    });
  }
}