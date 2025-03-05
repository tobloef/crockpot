import type { Class } from "../utils/class.ts";
import { Edge } from "./edge.ts";
import type { Nodelike, ReferenceName, } from "../query/run-query.types.ts";

export abstract class EdgeQueryItem<
  ClassType extends Class<Edge> = Class<Edge>,
> {
  #brand = "EdgeQueryItem" as const;

  class: ClassType;

  constructor(params: {
    class: ClassType,
  }) {
    this.class = params.class;
  }
}

export class NamedEdgeQueryItem<
  ClassType extends Class<Edge> = Class<Edge>,
  Name extends string = ReferenceName
> extends EdgeQueryItem<ClassType> {
  #brand = "NamedEdgeQueryItem" as const;

  name: Name;

  constructor(params: {
    class: ClassType,
    name: Name,
  }) {
    super(params);
    this.name = params.name;
  }

  to<
    ToItem extends Nodelike
  >(
    item: ToItem
  ) {
    return new NamedRelatedEdgeQueryItem<
      ClassType,
      Name,
      ToItem,
      Nodelike,
      Nodelike[]
    >({
      class: this.class,
      name: this.name,
      toItem: item,
    });
  }

  from<
    FromItem extends Nodelike
  >(
    item: FromItem
  ) {
    return new NamedRelatedEdgeQueryItem<
      ClassType,
      Name,
      Nodelike,
      FromItem,
      Nodelike[]
    >({
      class: this.class,
      name: this.name,
      fromItem: item,
    });
  }

  fromOrTo<
    FromOrToItems extends Nodelike[]
  >(
    ...items: FromOrToItems
  ) {
    if (items.length > 2) {
      throw new Error(`The "fromOrTo" parameter can only accept up to 2 items, but ${items.length} were given.`);
    }

    return new NamedRelatedEdgeQueryItem<
      ClassType,
      Name,
      Nodelike,
      Nodelike,
      FromOrToItems
    >({
      class: this.class,
      name: this.name,
      fromOrToItems: items,
    });
  }
}

export class RelatedEdgeQueryItem<
  ClassType extends Class<Edge> = Class<Edge>,
  ToItem extends Nodelike = Nodelike,
  FromItem extends Nodelike = Nodelike,
  FromOrToItems extends Nodelike[] = Nodelike[],
> extends EdgeQueryItem<ClassType> {
  #brand = "RelatedEdgeQueryItem" as const;

  toItem?: ToItem;
  fromItem?: FromItem;
  fromOrToItems?: FromOrToItems;

  constructor(params: {
    class: ClassType,
    toItem?: ToItem,
    fromItem?: FromItem,
    fromOrToItems?: FromOrToItems,
  }) {
    super(params);
    this.toItem = params.toItem;
    this.fromItem = params.fromItem;
    this.fromOrToItems = params.fromOrToItems;
  }

  as<
    Name extends ReferenceName
  >(
    name: Name,
  ) {
    return new NamedRelatedEdgeQueryItem<
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
    return new RelatedEdgeQueryItem<
      ClassType,
      ToItem,
      FromItem,
      FromOrToItems
    >({
      class: this.class,
      toItem: item,
    });
  }

  from<
    FromItem extends Nodelike
  >(
    item: FromItem
  ) {
    return new RelatedEdgeQueryItem<
      ClassType,
      ToItem,
      FromItem,
      FromOrToItems
    >({
      class: this.class,
      fromItem: item,
    });
  }
}

export class NamedRelatedEdgeQueryItem<
  ClassType extends Class<Edge> = Class<Edge>,
  Name extends string = ReferenceName,
  ToItem extends Nodelike = Nodelike,
  FromItem extends Nodelike = Nodelike,
  FromOrToItems extends Nodelike[] = Nodelike[],
> extends EdgeQueryItem<ClassType> {
  #brand = "NamedRelatedEdgeQueryItem" as const;

  name: Name;
  toItem?: ToItem;
  fromItem?: FromItem;
  fromOrToItems?: FromOrToItems;

  constructor(params: {
    class: ClassType,
    name: Name,
    toItem?: ToItem,
    fromItem?: FromItem,
    fromOrToItems?: FromOrToItems,
  }) {
    super(params);
    this.name = params.name;
    this.toItem = params.toItem;
    this.fromItem = params.fromItem;
    this.fromOrToItems = params.fromOrToItems;
  }

  to<
    ToItem extends Nodelike
  >(
    item: ToItem
  ) {
    return new NamedRelatedEdgeQueryItem<
      ClassType,
      Name,
      ToItem,
      FromItem,
      FromOrToItems
    >({
      class: this.class,
      name: this.name,
      toItem: item,
    });
  }

  from<
    FromItem extends Nodelike
  >(
    item: FromItem
  ) {
    return new NamedRelatedEdgeQueryItem<
      ClassType,
      Name,
      ToItem,
      FromItem,
      FromOrToItems
    >({
      class: this.class,
      name: this.name,
      fromItem: item,
    });
  }
}
