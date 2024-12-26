import type { QueryPart } from "./part.ts";

export type QueryInput<Part = QueryPart> = (
  | QueryArrayInput<Part>
  | QueryObjectInput<Part>
  ); // TODO: Remove generic param?

export type QueryArrayInput<Part> = Part[] | readonly Part[];

export type QueryObjectInput<Part> = Record<string, Part>

export type SpreadOrObjectQueryInput<Input extends QueryInput<Part>, Part> = (
  Input extends QueryArrayInput<Part>
  ? Input
  : Input extends QueryObjectInput<Part>
    ? [ Input ]
    : never
  );
