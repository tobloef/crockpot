import type { QueryInput } from "./query-input.ts";
import type { QueryOutput } from "./query-output.ts";
import { NotImplementedError } from "../src/utils/errors/not-implemented-error.ts";

export class Graph {
  query<
    Input extends QueryInput<Input>
  >(
    items: Input
  ): QueryOutput<Input> {
    throw new NotImplementedError();
  }
}
