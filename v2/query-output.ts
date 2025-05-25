import type { Prettify } from "../src/utils/prettify.ts";
import type { Writable } from "../src/utils/writable.ts";
import type { EdgeItem, NodeItem, QueryInput, SubQueryInput } from "./query-input.ts";
import type { GraphNode } from "./node.ts";

export type QueryOutput<
  Input extends QueryInput<any>
> = Prettify<{
  [Key in keyof Input]: (
    Input[Key] extends EdgeItem<infer _, infer EdgeType, infer _>
      ? EdgeType extends typeof GraphEdge
        ? InstanceType<EdgeType>
        : EdgeType
      : Input[Key] extends NodeItem
        ? Input[Key] extends typeof GraphNode
          ? InstanceType<Input[Key]>
          : Input[Key]
        : Input[Key] extends SubQueryInput<any>
          ? QueryOutput<Input[Key]>
          : never
    );
}>
