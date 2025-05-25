import type { GraphNode } from "./node.ts";
import type { OmitNever } from "./omit-never.ts";

export type QueryInput<
  BaseInput extends QueryInput<BaseInput, OptionalInputs, WithoutInputs, AnyOfInputs>,
  OptionalInputs extends Array<QueryInput<BaseInput, OptionalInputs, WithoutInputs, AnyOfInputs>>,
  WithoutInputs extends Array<QueryInput<BaseInput, OptionalInputs, WithoutInputs, AnyOfInputs>>,
  AnyOfInputs extends Array<Array<QueryInput<BaseInput, OptionalInputs, WithoutInputs, AnyOfInputs>>>
> = {
  [Key: string]: (
    | InputItem<(
      | NodeKeys<BaseInput>
      | ArrayOfNodeKeys<OptionalInputs>
      | ArrayOfNodeKeys<WithoutInputs>
      | ArrayOfArrayOfNodeKeys<AnyOfInputs>
    )>
    | QueryInput<BaseInput, OptionalInputs, WithoutInputs, AnyOfInputs>
  );
};

type Test = ArrayOfArrayOfNodeKeys<[
  [
    { a: GraphNode },
    { b: { a: GraphNode } },
  ],
  [
    { c: GraphNode },
    { d: { e: GraphNode } },
  ]
]>

export type QI<
  T extends QI<any>
> = {
  [Key: string]: (
    | InputItem<NodeKeys<T>>
    | QI<T>
    );
};

export type NodeItem = (
  | typeof GraphNode
  | GraphNode
  );

export type EdgeItem<
  FromNodeKey extends string,
  Type extends typeof GraphEdge | GraphEdge,
  ToNodeKey extends string
> = [
  FromNodeKey,
  Type,
  ToNodeKey
];

export type InputItem<
  NodeKey extends string
> = (
  | NodeItem
  | EdgeItem<NodeKey, typeof GraphEdge | GraphEdge, NodeKey>
  )

type NodeKeys<BaseInput extends QI<any>> = KeysAsDotNotation<NodesOnly<BaseInput>>;

export type ArrayOfNodeKeys<
  Inputs extends Array<QI<any>>
> = (
  Inputs extends Array<infer Input>
    ? Input extends QueryInput<any, any, any, any>
      ? NodeKeys<Input>
      : never
    : never
  );

export type ArrayOfArrayOfNodeKeys<
  Inputs extends Array<Array<QI<any>>>
> = (
  Inputs extends Array<infer Input>
    ? Input extends Array<QI<any>>
      ? ArrayOfNodeKeys<Input>
      : never
    : never
  );

type NodesOnly<T extends QI<any>> = OmitNever<{
  [Key in keyof T]: (
    T[Key] extends NodeItem
      ? Key
      : T[Key] extends QI<any>
        ? {} extends NodesOnly<T[Key]>
          ? never
          : NodesOnly<T[Key]>
        : never
    );
}>

type KeysAsDotNotation<
  T,
  Key extends keyof T = keyof T
> = (
  Key extends string
    ? T extends string
      ? never
      : (
        Key |
        `${Key}.${KeysAsDotNotation<Exclude<T[Key], undefined>>}`
        )
    : never
  );

