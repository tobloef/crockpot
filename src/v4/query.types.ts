import type { Class, Instance } from "./utils/class.ts";
import type { Node } from "./node.ts";
import type { NodeQueryItem } from "./node-query-item.ts";
import type { Edge } from "./edge.ts";
import type { EdgeQueryItem } from "./edge-query-item.ts";
import type { Either } from "./either.ts";

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
  | NodeQueryItem<any, any, any, any, any>
  | string
  | Either<Nodelike[]>
);

export type Edgelike = (
  | Class<Edge>
  | Edge
  | EdgeQueryItem<any, any, any, any, any>
  | string
  | Either<Edgelike[]>
);

export type QueryOutput<Input extends QueryInput> = (
  Input extends []
    ? Generator<never>
    : {} extends Input
      ? Generator<never>
      : Input extends ArrayQueryInput
        ? Generator<ArrayQueryOutput<Input, Input>>
        : Input extends ObjectQueryInput
          ? Generator<ObjectQueryOutput<Input, Input>>
          : Input extends QueryInputItem
            ? Generator<QueryOutputItem<Input, Input>>
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
  Item extends Either<infer Types> ? TypesToUnion<Types, FullInput> :
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

type ReferencedTypes<Input extends QueryInput> = (
  Input extends ArrayQueryInput
    ? ReferencedTypeFromArray<Input>
    : Input extends ObjectQueryInput
      ? ReferencedTypeFromArray<ObjectValueTuple<Input>>
      : Input extends QueryInputItem
        ? ReferencedTypeFromArray<[Input]>
        : never
);

type ReferencedTypeFromArray<Items extends QueryInputItem[]> = (
  Items extends [infer First, ...infer Rest]
    ? Rest extends QueryInputItem[]
      ? First extends NodeQueryItem<
        infer Type,
        infer Name,
        infer WithItems,
        infer ToItems,
        infer FromItems
      >
        ? (
          & ExpandQueryItem<Type, Name, WithItems, ToItems, FromItems>
          & ReferencedTypeFromArray<Rest>
        )
        : First extends EdgeQueryItem<
          infer Type,
          infer Name,
          infer WithItems,
          infer ToItems,
          infer FromItems
        >
        ? (
          & ExpandQueryItem<Type, Name, WithItems, ToItems, FromItems>
          & ReferencedTypeFromArray<Rest>
        )
        : ReferencedTypeFromArray<Rest>
      : {}
    : {}
);

type ExpandQueryItem<
  Type,
  Name extends string,
  WithItems extends QueryInputItem[],
  ToItems extends QueryInputItem[],
  FromItems extends QueryInputItem[],
> = (
  Type extends (Class<Node> | Class<Edge>)
    ? (
      & ReferencedType<Type, Name>
      & ReferencedTypeFromArray<[...WithItems, ...ToItems, ...FromItems]>
    )
    : ReferencedTypeFromArray<[...WithItems, ...ToItems, ...FromItems]>
)

type ReferencedType<
  Type extends Class<Node> | Class<Edge>,
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