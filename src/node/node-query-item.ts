import type { Class } from "../utils/class.ts";
import { Node } from "./node.ts";
import type { Edgelike, Nodelike, ReferenceName, } from "../query/run-query.types.ts";

export class NodeQueryItem<
  ClassType extends Class<Node> = Class<Node>,
> {
  #brand = "NodeQueryItem" as const;

  class: ClassType;
  excludedClassTypes?: Class<Node>[];

  constructor(params: {
    class: ClassType,
    excludedClassTypes?: Class<Node>[],
  }) {
    this.class = params.class;
    this.excludedClassTypes = params.excludedClassTypes;
  }

  excluding(
    ...excludedClassTypes: Class<Node>[]
  ) {
    return new NodeQueryItem<ClassType>({
      class: this.class,
      excludedClassTypes,
    });
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
    excludedClassTypes?: Class<Node>[],
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
      excludedClassTypes: this.excludedClassTypes,
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
    excludedClassTypes?: Class<Node>[],
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
      excludedClassTypes: this.excludedClassTypes,
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
      excludedClassTypes: this.excludedClassTypes,
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
      excludedClassTypes: this.excludedClassTypes,
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
      excludedClassTypes: this.excludedClassTypes,
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
    excludedClassTypes?: Class<Node>[],
  }) {
    super(params);
    this.name = params.name;
    this.withItems = params.withItems;
    this.toItems = params.toItems;
    this.fromItems = params.fromItems;
    this.fromOrToItems = params.fromOrToItems;
  }
}
