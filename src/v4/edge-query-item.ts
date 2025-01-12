import type { Class } from "./utils/class.ts";
import { Edge } from "./edge.ts";
import type { Edgelike, Nodelike } from "./query.types.ts";

export class EdgeQueryItem<
  Type extends Class<Edge> = Class<Edge>,
  Name extends string = string,
  WithItems extends Nodelike[] = [],
  ToItems extends Nodelike[] = [],
  FromItems extends Nodelike[] = [],
> {
  #brand = 'EdgeQueryItem' as const;

  type: Type;
  name?: Name;
  withItems?: WithItems;
  toItems?: ToItems;
  fromItems?: FromItems;

  constructor(params: {
    type: Type,
    name?: Name,
    withItems?: WithItems,
    toItems?: ToItems,
    fromItems?: FromItems,
  }) {
    this.type = params.type;
    this.name = params.name;
    this.withItems = params.withItems;
    this.toItems = params.toItems;
    this.fromItems = params.fromItems;
  }

  as<
    Name extends string
  >(
    name: Name,
  ) {
    return new EdgeQueryItem<
      Type,
      Name,
      WithItems,
      ToItems,
      FromItems
    >({
      class: this.type,
      name,
      toItems: this.toItems,
      withItems: this.withItems,
      fromItems: this.fromItems,
    });
  }

  with<
    WithItems extends Nodelike[]
  >(
    ...items: WithItems
  ) {
    return new EdgeQueryItem<
      Type,
      Name,
      WithItems,
      ToItems,
      FromItems
    >({
      class: this.type,
      name: this.name,
      toItems: this.toItems,
      withItems: items,
      fromItems: this.fromItems,
    });
  }

  to<
    ToItems extends Nodelike[]
  >(
    ...items: ToItems
  ) {
    return new EdgeQueryItem<
      Type,
      Name,
      WithItems,
      ToItems,
      FromItems
    >({
      class: this.type,
      name: this.name,
      withItems: this.withItems,
      toItems: items,
      fromItems: this.fromItems,
    });
  }

  from<
    FromItems extends Nodelike[]
  >(
    ...items: FromItems
  ) {
    return new EdgeQueryItem<
      Type,
      Name,
      WithItems,
      ToItems,
      FromItems
    >({
      class: this.type,
      name: this.name,
      withItems: this.withItems,
      toItems: this.toItems,
      fromItems: items,
    });
  }
}
