import type { Class } from "./utils/class.ts";
import type { Node } from "./node.ts";
import type { NodeQueryItem } from "./node-query-item.ts";
import type { Edge } from "./edge.ts";
import type { EdgeQueryItem } from "./edge-query-item.ts";
import { Either } from "./either.ts";

export type QueryInput = (
  | QueryInputItem
  | ArrayQueryInput
  | ObjectQueryInput
  );

export type ArrayQueryInput = QueryInputItem[];

export type ObjectQueryInput = {
  [key: string]: QueryInput;
};

export type QueryInputItem = (
  | Nodelike
  | Edgelike
  );

export type Nodelike = (
  | Class<Node>
  | Node
  | NodeQueryItem<any, any>
  | string
  | Either<Nodelike>
  );

export type Edgelike = (
  | Class<Edge>
  | Edge
  | EdgeQueryItem<any, any>
  | string
  | Either<Edgelike>
  )

export type QueryOutput<Input extends QueryInput> = (
  [] extends Input
    ? Generator<never>
    : {} extends Input
      ? Generator<never>
      : Input extends ArrayQueryInput
        ? Generator<ArrayQueryOutput<Input>>
        : Input extends ObjectQueryInput
          ? Generator<ObjectQueryOutput<Input>>
          : Generator<QueryOutputItem<Input>>
);

export type ArrayQueryOutput<Input extends ArrayQueryInput> = (
  Input extends [infer First, ...infer Rest]
    ? First extends QueryInputItem
      ? Rest extends QueryInputItem[]
        ? [QueryOutputItem<First>, ...ArrayQueryOutput<Rest>]
        : never
      : never
    : []
);

export type ObjectQueryOutput<Input extends ObjectQueryInput> = (
  { [Key in keyof Input]: QueryOutputItem<Input[Key]> }
)

export type QueryOutputItem<Input extends QueryInput> = (
  Input extends Class<Node> ? InferClassType<Input> :
  Input extends Class<Edge> ? InferClassType<Input> :
  Input extends Node ? Input :
  Input extends Edge ? Input :
  Input extends Either<infer Types> ? TypesToUnion<Types> :
  unknown
);

export type InferClassType<Input extends Class<any>> = (
  Input extends Class<infer Type> ? Type : never
);

export type InferEitherTypes<Input extends Either<QueryInputItem[]>> = (
  Input extends Either<infer Types>
    ? Types extends QueryInputItem[]
      ? TypesToUnion<Types>
      : never
    : never
);

type TypesToUnion<Types> =
  Types extends [infer First, ...infer Rest]
    ? First extends QueryInputItem
      ? Rest extends QueryInputItem[]
        ? QueryOutputItem<First> extends never
          ? (undefined | TypesToUnion<Rest>)
          : (QueryOutputItem<First> | TypesToUnion<Rest>)
        : never
      : never
    : never;