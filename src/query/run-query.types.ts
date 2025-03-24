import type { Class, Instance } from "../utils/class.ts";
import type { Node } from "../node/node.ts";
import type { Edge } from "../edge/edge.ts";
import { NodeQueryItem } from "../node/node-query-item.ts";
import type { IsNotUnion, TuplifyUnion } from "../utils/union.ts";
import type { EdgeQueryItem } from "../edge/edge-query-item.ts";

export type QueryInput = (
  | QueryInputItem
  | ArrayQueryInput
  | ObjectQueryInput
);

export type ArrayQueryInput = QueryInputItem[];

export type ObjectQueryInput = {
  [key: string]: QueryInputItem;
};

export type QueryInputItem = (
  | Nodelike
  | Edgelike
);

export type Nodelike = (
  | Class<Node>
  | Node
  | NodeQueryItem<any>
  | ReferenceName
);

export type Edgelike = (
  | Class<Edge>
  | Edge
  | EdgeQueryItem<any>
  | ReferenceName
);

export type ReferenceName = string;

export type QueryOutput<Input extends QueryInput> = (
  Input extends ArrayQueryInput
    ? (ArrayQueryOutput<Input, Input>)
    : Input extends ObjectQueryInput
      ? (ObjectQueryOutput<Input, Input>)
      : Input extends QueryInputItem
        ? (QueryOutputItem<Input, Input>)
        : never
);

export type ArrayQueryOutput<
  Items extends ArrayQueryInput,
  FullInput extends QueryInput
> = (
  Items extends [infer First, ...infer Rest]
    ? First extends QueryInputItem
      ? Rest extends QueryInputItem[]
        ? [
          QueryOutputItem<First, FullInput>,
          ...ArrayQueryOutput<Rest, FullInput>
        ]
        : never
      : never
    : []
);

export type ObjectQueryOutput<
  O extends ObjectQueryInput,
  FullInput extends QueryInput
> = (
  { [K in keyof O]: QueryOutputItem<O[K], FullInput> }
);

export type QueryOutputItem<
  Item extends QueryInputItem,
  FullInput extends QueryInput
> = (
  Item extends Class<Node> ? Instance<Item> :
  Item extends Class<Edge> ? Instance<Item> :
  Item extends Node ? Item :
  Item extends Edge ? Item :
  Item extends NodeQueryItem<infer Type> ? Instance<Type> :
  Item extends EdgeQueryItem<infer Type> ? Instance<Type> :
  Item extends ReferenceName ? InferTypeByReferenceName<Item, FullInput> :
  unknown
);

export type InferTypeByReferenceName<
  Name extends ReferenceName,
  FullInput extends QueryInput
> = (
  Name extends keyof ReferencedTypes<FullInput>
    ? ReferencedTypes<FullInput>[Name]
    : UnknownReference
);

type UnknownReference = Node | Edge;
type NodeOrEdgeClass = Class<Node> | Class<Edge>;

export type ReferencedTypes<Input extends QueryInput> = (
  Input extends ArrayQueryInput
    ? ReferencedTypeFromArray<Input, never>
    : Input extends ObjectQueryInput
      ? ReferencedTypeFromArray<ObjectValueTuple<Input>, never>
      : Input extends QueryInputItem
        ? ReferencedTypeFromArray<[Input], never>
        : never
);

type ReferencedTypeFromArray<
  Items extends QueryInputItem[],
  FallbackType extends NodeOrEdgeClass
> = (
  Items extends [infer First, ...infer Rest]
    ? Rest extends QueryInputItem[]
      ? First extends NodeQueryItem<
          infer ClassType,
          infer Name,
          infer WithItems,
          infer ToItems,
          infer FromItems,
          infer FromOrToItems,
          infer IsOptional
        >
        ? (
          & ExpandQueryItem<ClassType, Name, WithItems, ToItems, FromItems, FromOrToItems>
          & ReferencedTypeFromArray<Rest, never>
        ) | (IsOptional extends true ? undefined : never)
        : First extends EdgeQueryItem<
          infer ClassType,
          infer Name,
          infer ToItem,
          infer FromItem,
          infer FromOrToItems,
          infer IsOptional
        >
          ? (
            & ExpandQueryItem<ClassType, Name, [], [ToItem], [FromItem], FromOrToItems>
            & ReferencedTypeFromArray<Rest, never>
          ) | (IsOptional extends true ? undefined : never)
          : First extends ReferenceName
            ? [FallbackType] extends [never]
              ? ReferencedTypeFromArray<Rest, never>
              : (
                & ReferencedType<FallbackType, First>
                & ReferencedTypeFromArray<Rest, never>
              )
            : ReferencedTypeFromArray<Rest, never>
      : {}
    : {}
);

type ExpandQueryItem<
  Type extends NodeOrEdgeClass,
  Name extends ReferenceName,
  WithItems extends QueryInputItem[],
  ToItems extends QueryInputItem[],
  FromItems extends QueryInputItem[],
  FromOrToItems extends QueryInputItem[]
> = (
  (
    & ReferencedType<Type, Name>
    & ReferencedTypeFromArray<WithItems, Class<Edge>>
    & ReferencedTypeFromArray<ToItems, Class<Node>>
    & ReferencedTypeFromArray<FromItems, Class<Node>>
    & ReferencedTypeFromArray<FromOrToItems, NodeOrEdgeClass>
  )
)

type ReferencedType<
  Type extends NodeOrEdgeClass,
  Name extends ReferenceName
> = (
  true extends IsValidKey<Name>
    ? { [key in ReferenceName as Name]: Instance<Type> }
    : {}
);

type IsValidKey<Key> = (ReferenceName extends Key ? false : true) & IsNotUnion<Key>;

type ObjectValueTuple<T, KS extends any[] = TuplifyUnion<keyof T>, R extends any[] = []> =
  KS extends [infer K, ...infer KT]
    ? ObjectValueTuple<T, KT, [...R, T[K & keyof T]]>
    : R
