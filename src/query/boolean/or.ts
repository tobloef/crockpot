import type { QueryPart } from "../part.ts";

export type Or<QueryParts extends QueryPart[]> = {
  __or: QueryParts;
};

const orFunction = <QueryParts extends QueryPart[]>(
  ...queryParts: QueryParts
): Or<QueryParts> => {
  return ({ __or: queryParts });
};

/** @alias or */
export const oneOf = orFunction;

/** @alias oneOf */
export const or = orFunction;