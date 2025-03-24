import type { Class } from "../utils/class.ts";
import { Node } from "./node.ts";
import type { Edgelike, Nodelike, ReferenceName, } from "../query/run-query.types.ts";
import { DEFAULT_OPTIONALITY_KEY } from "../query/optional.ts";

export class NodeQueryItem<
  ClassType extends Class<Node> = Class<Node>,
  Name extends ReferenceName = ReferenceName,
  WithItems extends Edgelike[] = Edgelike[],
  ToItems extends Nodelike[] = Nodelike[],
  FromItems extends Nodelike[] = Nodelike[],
  FromOrToItems extends Nodelike[] = Nodelike[]
> {
  #brand = "NodeQueryItem" as const;

  class: ClassType;
  name?: Name;
  withItems?: WithItems;
  toItems?: ToItems;
  fromItems?: FromItems;
  fromOrToItems?: FromOrToItems;
  excludedClassTypes?: Class<Node>[];
  optionalityKey?: string;

  constructor(params: {
    class: ClassType,
    name?: Name,
    withItems?: WithItems,
    toItems?: ToItems,
    fromItems?: FromItems,
    fromOrToItems?: FromOrToItems,
    excludedClassTypes?: Class<Node>[],
    optionalityKey?: string,
  }) {
    this.class = params.class;
    this.name = params.name;
    this.withItems = params.withItems;
    this.toItems = params.toItems;
    this.fromItems = params.fromItems;
    this.fromOrToItems = params.fromOrToItems;
    this.excludedClassTypes = params.excludedClassTypes;
    this.optionalityKey = params.optionalityKey;
  }

  excluding(
    ...excludedClassTypes: Class<Node>[]
  ) {
    return new NodeQueryItem<ClassType>({
      ...this,
      excludedClassTypes,
    });
  }

  as<
    Name extends ReferenceName
  >(
    name: Name,
  ) {
    return new NodeQueryItem<
      ClassType,
      Name,
      WithItems,
      ToItems,
      FromItems,
      FromOrToItems
    >({
      ...this,
      name,
    });
  }

  optional(
    optionalityGroup: string = DEFAULT_OPTIONALITY_KEY,
  ) {
    return new NodeQueryItem<
      ClassType,
      Name,
      WithItems,
      ToItems,
      FromItems,
      FromOrToItems
    >({
      ...this,
      optionalityKey: optionalityGroup,
    });
  }

  with<
    WithItems extends Edgelike[]
  >(
    ...items: WithItems
  ) {
    return new NodeQueryItem<
      ClassType,
      Name,
      WithItems,
      ToItems,
      FromItems,
      FromOrToItems
    >({
      ...this,
      withItems: items,
    });
  }

  to<
    ToItems extends Nodelike[]
  >(
    ...items: ToItems
  ) {
    return new NodeQueryItem<
      ClassType,
      Name,
      WithItems,
      ToItems,
      FromItems,
      FromOrToItems
    >({
      ...this,
      toItems: items,
    });
  }

  from<
    FromItems extends Nodelike[]
  >(
    ...items: FromItems
  ) {
    return new NodeQueryItem<
      ClassType,
      Name,
      WithItems,
      ToItems,
      FromItems,
      FromOrToItems
    >({
      ...this,
      fromItems: items,
    });
  }

  fromOrTo<
    FromOrToItems extends Nodelike[]
  >(
    ...items: FromOrToItems
  ) {
    return new NodeQueryItem<
      ClassType,
      Name,
      WithItems,
      ToItems,
      FromItems,
      FromOrToItems
    >({
      ...this,
      fromOrToItems: items,
    });
  }
}
