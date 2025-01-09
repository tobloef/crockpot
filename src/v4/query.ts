import type { Class } from "./utils/class.ts";
import type { Node } from "./node.ts";
import type { NodeQueryItem } from "./node-query-item.ts";
import type { Edge } from "./edge.ts";
import type { EdgeQueryItem } from "./edge-query-item.ts";

export type Nodelike = (
  | Class<Node>
  | Node
  | NodeQueryItem<any, any>
  | string
  );

export type Edgelike = (
  | Class<Edge>
  | Edge
  | EdgeQueryItem<any, any>
  | string
  )

export type QueryInput = (
  | QueryInputItem
  | ArrayQueryInput
  | ObjectQueryInput
);

export type QueryInputItem = (
  | Nodelike
  | Edgelike
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