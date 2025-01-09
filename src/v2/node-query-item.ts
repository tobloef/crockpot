import type { Class } from "./utils/class.ts";
import { Node } from "./node.ts";
import type { EdgeQueryItem } from "./edge-query-item.ts";

export class NodeQueryItem<
  Type extends Class<Node>,
  Name extends string
> {
  type: Type;
  name?: Name;

  constructor(params: {
    type: Type,
    name?: Name,
  }) {
    this.type = params.type;
    this.name = params.name;
  }

  static as<
    Type extends Class<Node>,
    Name extends string,
  >(
    this: Type,
    name: Name,
  ): NodeQueryItem<Type, Name> {
    return new NodeQueryItem<Type, Name>({
      type: this,
      name,
    });
  }

  static with(input: (
    | Class<Node>
    | Node
    | NodeQueryItem<any, any>
    | EdgeQueryItem<any>
    | string
  )) {

  }

  static on() {

  }
}
