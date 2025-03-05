import type { Class } from "../utils/class.ts";
import { Node } from "./node.ts";
import type { Edgelike, Nodelike, ReferenceName, } from "../query/run-query.types.ts";

export class NodeQueryItem<
  ClassType extends Class<Node> = Class<Node>,
> {
  #brand = "NodeQueryItem" as const;

  class: ClassType;

  constructor(params: {
    class: ClassType,
  }) {
    this.class = params.class;
  }
}

export class RelatedNodeQueryItem<
  ClassType extends Class<Node> = Class<Node>,
  WithItems extends Edgelike[] = Edgelike[],
  ToItems extends Nodelike[] = Nodelike[],
  FromItems extends Nodelike[] = Nodelike[],
  FromOrToItems extends Nodelike[] = Nodelike[],
> extends NodeQueryItem<ClassType> {
  #brand = "RelatedNodeQueryItem" as const;

  withItems?: WithItems;
  toItems?: ToItems;
  fromItems?: FromItems;
  fromOrToItems?: FromOrToItems;

  constructor(params: {
    class: ClassType,
    withItems?: WithItems,
    toItems?: ToItems,
    fromItems?: FromItems,
    fromOrToItems?: FromOrToItems,
  }) {
    super(params);
    this.withItems = params.withItems;
    this.toItems = params.toItems;
    this.fromItems = params.fromItems;
    this.fromOrToItems = params.fromOrToItems;
  }

  as<
    Name extends ReferenceName
  >(
    name: Name,
  ) {
    return new NamedRelatedNodeQueryItem<
      ClassType,
      Name,
      WithItems,
      ToItems,
      FromItems,
      FromOrToItems
    >({
      class: this.class,
      name,
      toItems: this.toItems,
      withItems: this.withItems,
      fromItems: this.fromItems,
      fromOrToItems: this.fromOrToItems,
    });
  }
}

export class NamedNodeQueryItem<
  ClassType extends Class<Node> = Class<Node>,
  Name extends ReferenceName = ReferenceName
> extends NodeQueryItem<ClassType> {
  #brand = "NamedNodeQueryItem" as const;

  name: Name;

  constructor(params: {
    class: ClassType,
    name: Name,
  }) {
    super(params);
    this.name = params.name;
  }

  with<
    WithItems extends Edgelike[]
  >(
    ...items: WithItems
  ) {
    return new NamedRelatedNodeQueryItem<
      ClassType,
      Name,
      WithItems,
      [],
      [],
      []
    >({
      class: this.class,
      name: this.name,
      withItems: items,
    });
  }

  to<
    ToItems extends Nodelike[]
  >(
    ...items: ToItems
  ) {
    return new NamedRelatedNodeQueryItem<
      ClassType,
      Name,
      [],
      ToItems,
      [],
      []
    >({
      class: this.class,
      name: this.name,
      toItems: items,
    });
  }

  from<
    FromItems extends Nodelike[]
  >(
    ...items: FromItems
  ) {
    return new NamedRelatedNodeQueryItem<
      ClassType,
      Name,
      [],
      [],
      FromItems,
      []
    >({
      class: this.class,
      name: this.name,
      fromItems: items,
    });
  }

  fromOrTo<
    FromOrToItems extends Nodelike[]
  >(
    ...items: FromOrToItems
  ) {
    return new NamedRelatedNodeQueryItem<
      ClassType,
      Name,
      [],
      [],
      [],
      FromOrToItems
    >({
      class: this.class,
      name: this.name,
      fromOrToItems: items,
    });
  }
}

export class NamedRelatedNodeQueryItem<
  ClassType extends Class<Node> = Class<Node>,
  Name extends ReferenceName = ReferenceName,
  WithItems extends Edgelike[] = Edgelike[],
  ToItems extends Nodelike[] = Nodelike[],
  FromItems extends Nodelike[] = Nodelike[],
  FromOrToItems extends Nodelike[] = Nodelike[],
> extends NodeQueryItem<ClassType> {
  #brand = "NamedRelatedNodeQueryItem" as const;

  name: Name;
  withItems?: WithItems;
  toItems?: ToItems;
  fromItems?: FromItems;
  fromOrToItems?: FromOrToItems;

  constructor(params: {
    class: ClassType,
    name: Name,
    withItems?: WithItems,
    toItems?: ToItems,
    fromItems?: FromItems,
    fromOrToItems?: FromOrToItems,
  }) {
    super(params);
    this.name = params.name;
    this.withItems = params.withItems;
    this.toItems = params.toItems;
    this.fromItems = params.fromItems;
    this.fromOrToItems = params.fromOrToItems;
  }
}