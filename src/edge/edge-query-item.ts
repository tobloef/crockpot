import type { Class } from "../utils/class.ts";
import { Edge } from "./edge.ts";
import type {
  Nodelike,
  ReferenceName,
} from "../query/run-query.types.ts";
import { DEFAULT_OPTIONALITY_KEY } from "../query/optional.ts";

export class EdgeQueryItem<
  ClassType extends Class<Edge> = Class<Edge>,
  Name extends string = ReferenceName,
  ToItem extends Nodelike = Nodelike,
  FromItem extends Nodelike = Nodelike,
  FromOrToItems extends Nodelike[] = Nodelike[],
  IsOptional extends boolean = false,
> {
  #brand = "EdgeQueryItem" as const;

  class: ClassType;
  name?: Name;
  toItem?: ToItem;
  fromItem?: FromItem;
  fromOrToItems?: FromOrToItems;
  excludedClassTypes?: Set<Class<Edge>>;
  optionalityKey?: string;

  constructor(params: {
    class: ClassType,
    name?: Name,
    toItem?: ToItem,
    fromItem?: FromItem,
    fromOrToItems?: FromOrToItems,
    excludedClassTypes?: Set<Class<Edge>>,
    optionalityKey?: string,
  }) {
    this.class = params.class;
    this.name = params.name;
    this.toItem = params.toItem;
    this.fromItem = params.fromItem;
    this.fromOrToItems = params.fromOrToItems;
    this.excludedClassTypes = params.excludedClassTypes;
    this.optionalityKey = params.optionalityKey;
  }

  except(
    ...excludedClassTypes: Class<Edge>[]
  ) {
    return new EdgeQueryItem<
      ClassType,
      Name,
      ToItem,
      FromItem,
      FromOrToItems,
      IsOptional
    >({
      ...this,
      excludedClassTypes: new Set(excludedClassTypes),
    });
  }

  as<
    Name extends ReferenceName
  >(
    name: Name,
  ) {
    return new EdgeQueryItem<
      ClassType,
      Name,
      ToItem,
      FromItem,
      FromOrToItems,
      IsOptional
    >({
      ...this,
      name,
    });
  }

  optional(
    optionalityGroup: string = DEFAULT_OPTIONALITY_KEY,
  ) {
    return new EdgeQueryItem<
      ClassType,
      Name,
      ToItem,
      FromItem,
      FromOrToItems,
      true
    >({
      ...this,
      optionalityKey: optionalityGroup,
    });
  }

  to<
    ToItem extends Nodelike
  >(
    item: ToItem
  ) {
    return new EdgeQueryItem<
      ClassType,
      Name,
      ToItem,
      FromItem,
      FromOrToItems,
      IsOptional
    >({
      ...this,
      toItem: item,
    });
  }

  from<
    FromItem extends Nodelike
  >(
    item: FromItem
  ) {
    return new EdgeQueryItem<
      ClassType,
      Name,
      ToItem,
      FromItem,
      FromOrToItems,
      IsOptional
    >({
      ...this,
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

    return new EdgeQueryItem<
      ClassType,
      Name,
      ToItem,
      FromItem,
      FromOrToItems,
      IsOptional
    >({
      ...this,
      fromOrToItems: items,
    });
  }
}
