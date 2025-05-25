import type {
  QueryInput,
} from "./query-input.ts";
import type { QueryOutput } from "./query-output.ts";
import { NotImplementedError } from "../src/utils/errors/not-implemented-error.ts";

export class Graph {
  query<
    Input extends QueryInput<Input, [], [], []>
  >(
    items: Input
  ): Query<Input, [], [], []> {
    return new Query(items, [], [], []);
  }
}

export class Query<
  BaseInput extends QueryInput<any, any, any, any>,
  OptionalInputs extends Array<QueryInput<any, any, any, any>>,
  WithoutInputs extends Array<QueryInput<any, any, any, any>>,
  AnyOfInputs extends Array<Array<QueryInput<any, any, any, any>>>
> {
  constructor(
    private readonly baseInput: BaseInput,
    private readonly optionalInputs: OptionalInputs,
    private readonly withoutInputs: WithoutInputs,
    private readonly anyOfInputs: AnyOfInputs,
  ) {}

  optional<
    OptionalInput extends QueryInput<
      BaseInput,
      [...OptionalInputs, OptionalInput],
      WithoutInputs,
      AnyOfInputs
    >
  >(
    input: OptionalInput
  ): Query<
    BaseInput,
    [...OptionalInputs, OptionalInput],
    WithoutInputs,
    AnyOfInputs
  > {
    return new Query(
      this.baseInput,
      [...this.optionalInputs, input],
      this.withoutInputs,
      this.anyOfInputs
    );
  }

  without<
    WithoutInput extends QueryInput<
      BaseInput,
      OptionalInputs,
      [...WithoutInputs, WithoutInput],
      AnyOfInputs
    >
  >(
    input: WithoutInput
  ): Query<
    BaseInput,
    OptionalInputs,
    [...WithoutInputs, WithoutInput],
    AnyOfInputs
  > {
    return new Query(
      this.baseInput,
      this.optionalInputs,
      [...this.withoutInputs, input],
      this.anyOfInputs
    );
  }

  anyOf<
    AnyOfInput extends Array<AnyOfInputPart>,
    AnyOfInputPart extends QueryInput<
      BaseInput,
      OptionalInputs,
      WithoutInputs,
      [...AnyOfInputs, AnyOfInput]
    >
  >(
    ...inputs: AnyOfInput
  ): Query<
    BaseInput,
    OptionalInputs,
    WithoutInputs,
    [...AnyOfInputs, AnyOfInput]
  > {
    return new Query(
      this.baseInput,
      this.optionalInputs,
      this.withoutInputs,
      [...this.anyOfInputs, inputs]
    );
  }

  run(): QueryOutput<BaseInput, OptionalInputs, WithoutInputs, AnyOfInputs> {
    throw new NotImplementedError();
  }
}
