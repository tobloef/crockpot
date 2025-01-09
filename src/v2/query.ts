import type { Class } from "./utils/class.ts";
import type { Node } from "./node.ts";
import type { NodeQueryItem } from "./node-query-item.ts";

export type QueryInput = (
  | QueryInputItem
  | ArrayQueryInput
  | ObjectQueryInput
);

export type QueryInputItem = (
  | Class<Node>
  | NodeQueryItem<any, any>
  | string
);

export type ArrayQueryInput = QueryInputItem[];

export type ObjectQueryInput = {
  [key: string]: QueryInput;
};

export type QueryOutput<Input extends QueryInput> = (
  Generator<QueryOutputItem<Input>>
);

export type QueryOutputItem<Input extends QueryInput> = (
  never // TODO
);