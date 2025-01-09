import type { Class } from "./utils/class.ts";
import { Node } from "./node.ts";

export class EdgeQueryItem<
  Type extends Class<Node>,
> {
  type: Type;

  constructor(params: {
    type: Type,
  }) {
    this.type = params.type;
  }
}