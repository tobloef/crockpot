import type { Class } from "./utils/class.ts";
import { Edge } from "./edge.ts";
import type { Nodelike } from "./query.ts";

export class EdgeQueryItem<
  Type extends Class<Edge>,
  Name extends string
> {
  #brand = 'EdgeQueryItem' as const;

  type: Type;
  name?: Name;
  withItems?: Nodelike[];
  toItems?: Nodelike[];
  fromItems?: Nodelike[];

  constructor(params: {
    type: Type,
    name?: Name,
    withItems?: Nodelike[],
    toItems?: Nodelike[],
    fromItems?: Nodelike[],
  }) {
    this.type = params.type;
    this.name = params.name;
    this.withItems = params.withItems;
    this.toItems = params.toItems;
    this.fromItems = params.fromItems;
  }

  as<Name extends string>(
    name: Name,
  ): EdgeQueryItem<Type, Name> {
    return new EdgeQueryItem<Type, Name>({
      type: this.type,
      name,
      toItems: this.toItems,
      withItems: this.withItems,
      fromItems: this.fromItems,
    });
  }

  with(
    ...items: Nodelike[]
  ): EdgeQueryItem<Type, string> {
    return new EdgeQueryItem({
      type: this.type,
      name: this.name,
      toItems: this.toItems,
      withItems: items,
      fromItems: this.fromItems,
    });
  }

  to(
    ...items: Nodelike[]
  ): EdgeQueryItem<Type, string> {
    return new EdgeQueryItem({
      type: this.type,
      name: this.name,
      withItems: this.withItems,
      toItems: items,
      fromItems: this.fromItems,
    });
  }

  from(
    ...items: Nodelike[]
  ): EdgeQueryItem<Type, string> {
    return new EdgeQueryItem({
      type: this.type,
      name: this.name,
      withItems: this.withItems,
      toItems: this.toItems,
      fromItems: items,
    });
  }
}
