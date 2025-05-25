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
      | DistributeNodeKeysRecursively<BaseInput>
      | DistributeNodeKeysRecursively<OptionalInputs>
      | DistributeNodeKeysRecursively<WithoutInputs>
      | DistributeNodeKeysRecursively<AnyOfInputs>
    )>
    | QueryInput<BaseInput, OptionalInputs, WithoutInputs, AnyOfInputs>
  );
};

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
);

type DistributeNodeKeysRecursively<Input> = (
  Input extends QI<any>
    ? NodeKeys<Input>
    : Input extends [infer First, ...infer Rest]
      ? DistributeNodeKeysRecursively<First> | DistributeNodeKeysRecursively<Rest>
      : never
)

export type NodeKeys<T extends QI<any>> = Values<OmitNever<{
  [Key in keyof T]: (
    Key extends string
      ? T[Key] extends EdgeItem<any, any, any>
        ? never
        : T[Key] extends NodeItem
          ? Key
          : T[Key] extends QI<any>
              ? `${Key}.${NodeKeys<T[Key]>}`
              : never
      : never
    )
}>>

type Values<Obj> = (
  Obj extends Record<string, any>
    ? Obj[keyof Obj]
    : never
);
