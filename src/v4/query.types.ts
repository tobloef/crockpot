import type { Class, Instance } from "./utils/class.ts";
import type { Node } from "./node.ts";
import type { NodeQueryItem } from "./node-query-item.ts";
import type { Edge } from "./edge.ts";
import type { EdgeQueryItem } from "./edge-query-item.ts";

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
  | NodeQueryItem<any, any, any, any, any, any>
);

export type Edgelike = (
  | Class<Edge>
  | Edge
  | EdgeQueryItem<any, any, any, any, any, any>
);

export type QueryOutput<Input extends QueryInput> = (
  Input extends []
    ? never
    : {} extends Input
      ? never
      : Input extends ArrayQueryInput
        ? ArrayQueryOutput<Input, Input>
        : Input extends ObjectQueryInput
          ? ObjectQueryOutput<Input, Input>
          : Input extends QueryInputItem
            ? QueryOutputItem<Input, Input>
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
  Item extends NodeQueryItem<infer Type, any, any, any, any> ? Instance<Type> :
  Item extends EdgeQueryItem<infer Type, any, any, any, any> ? Instance<Type> :
  Item extends string ? InferTypeByReferenceName<Item, FullInput> :
  unknown
);

type TypesToUnion<
  Types extends QueryInputItem[],
  FullInput extends QueryInput
> = (
  Types extends [infer First, ...infer Rest]
    ? First extends QueryInputItem
      ? Rest extends QueryInputItem[]
        ? QueryOutputItem<First, FullInput> extends never
          ? (undefined | TypesToUnion<Rest, FullInput>)
          : (QueryOutputItem<First, FullInput> | TypesToUnion<Rest, FullInput>)
        : never
      : never
    : never
);

type InferTypeByReferenceName<
  Name extends string,
  FullInput extends QueryInput
> = (
  Name extends keyof ReferencedTypes<FullInput>
    ? ReferencedTypes<FullInput>[Name]
    : UnknownReference
);

type UnknownReference = Node | Edge;
type NodeOrEdgeClass = Class<Node> | Class<Edge>;

type ReferencedTypes<Input extends QueryInput> = (
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
        infer FromOrToItems
      >
        ? (
          & ExpandQueryItem<ClassType, Name, WithItems, ToItems, FromItems, FromOrToItems>
          & ReferencedTypeFromArray<Rest, never>
        )
        : First extends EdgeQueryItem<
          infer ClassType,
          infer Name,
          infer WithItems,
          infer ToItem,
          infer FromItem,
          infer FromOrToItem
        >
        ? (
          & ExpandQueryItem<ClassType, Name, WithItems, [ToItem], [FromItem], [FromOrToItem]>
          & ReferencedTypeFromArray<Rest, never>
        )
        : First extends string
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
  Name extends string,
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
  Name extends string
> = (
  true extends IsValidKey<Name>
    ? { [key in string as Name]: Instance<Type> }
    : {}
);

type LastOf<T> = UnionToIntersection<T extends any ? () => T : never> extends () => (infer R) ? R : never

type TuplifyUnion<T, L = LastOf<T>, N = [T] extends [never] ? true : false> =
  true extends N ? [] : [...TuplifyUnion<Exclude<T, L>>, L];

type ObjectValueTuple<T, KS extends any[] = TuplifyUnion<keyof T>, R extends any[] = []> =
  KS extends [infer K, ...infer KT]
    ? ObjectValueTuple<T, KT, [...R, T[K & keyof T]]>
    : R

type IsNotUnion<T> = IsUnion<T> extends true ? false : true;
type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;
type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends ((x: infer I) => void) ? I : never;
type IsValidKey<Key> = (string extends Key ? false : true) & IsNotUnion<Key>;