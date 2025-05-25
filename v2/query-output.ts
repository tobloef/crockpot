import type { Prettify } from "../src/utils/prettify.ts";
import type {
  EdgeItem,
  NodeItem,
  QI,
  QueryInput,
} from "./query-input.ts";
import type { GraphNode } from "./node.ts";

export type QueryOutput<
  BaseInput extends QueryInput<BaseInput, OptionalInputs, WithoutInputs, AnyOfInputs>, // TODO: Can the generics be any?
  OptionalInputs extends Array<QueryInput<BaseInput, OptionalInputs, WithoutInputs, AnyOfInputs>>,
  WithoutInputs extends Array<QueryInput<BaseInput, OptionalInputs, WithoutInputs, AnyOfInputs>>,
  AnyOfInputs extends Array<Array<QueryInput<BaseInput, OptionalInputs, WithoutInputs, AnyOfInputs>>>
> = Prettify<(
  ParseInput<BaseInput>
  & Optional<DistributeInputs<OptionalInputs>>
  & DistributeAnyOfInputs<AnyOfInputs>
)>;

type DistributeAnyOfInputs<
  Inputs extends Array<Array<QI<any>>>
> = (
  Inputs extends [infer Input, ...infer Rest]
    ? Input extends Array<QI<any>>
      ? Rest extends Array<Array<QI<any>>>
        ? Optional<DistributeInputs<Input>> & DistributeAnyOfInputs<Rest>
        : Optional<DistributeInputs<Input>>
      : {}
    : {}
);

type DistributeInputs<
  Inputs extends Array<QI<any>>
> = (
  Inputs extends [infer Input, ...infer Rest]
    ? Input extends QI<any>
      ? Rest extends Array<QI<any>>
        ? (Prettify<ParseInput<Input>> & DistributeInputs<Rest>)
        : Prettify<ParseInput<Input>>
      : {}
    : {}
  );

type ParseInput<
  Input extends QI<any>
> = {
  [Key in keyof Input]: (
    Input[Key] extends EdgeItem<infer _, infer EdgeType, infer _>
      ? EdgeType extends typeof GraphEdge
        ? InstanceType<EdgeType>
        : EdgeType
      : Input[Key] extends NodeItem
        ? Input[Key] extends typeof GraphNode
          ? InstanceType<Input[Key]>
          : Input[Key]
        : Input[Key] extends QI<any>
          ? Prettify<ParseInput<Input[Key]>>
          : never
    );
}

type Optional<T extends Record<string, any>> = {
  [Key in keyof T]: T[Key] | undefined;
}
