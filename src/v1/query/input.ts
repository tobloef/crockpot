import type { QueryPart } from "./part.ts";

export type QueryInput = (
  | QueryArrayInput
  | QueryObjectInput
  );

export type QueryArrayInput = QueryPart[] | readonly QueryPart[];

export type QueryObjectInput = Record<string, QueryPart>

export type SpreadOrObjectQueryInput<Input extends QueryInput> = (
  Input extends QueryArrayInput
    ? Input
    : Input extends QueryObjectInput
      ? [Input]
      : never
  );
