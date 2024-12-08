import type { QueryPart } from "./part.js";

export type QueryInput<Part = QueryPart> = QueryArrayInput<Part> | QueryObjectInput<Part> | Part;

export type QueryArrayInput<Part> = Array<Part>;

export type QueryObjectInput<Part> = Record<string, Part>

export type SpreadOrObjectQueryInput<Input extends QueryInput<Part>, Part> = (
  Input extends QueryArrayInput<Part>
    ? Input
    : Input extends QueryObjectInput<Part>
      ? [Input]
      : never
  );
