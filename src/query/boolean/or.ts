import type { QueryPart } from "../part.ts";

export type Or<QueryParts extends QueryPart[]> = {
  __or: QueryParts;
};

export function or<QueryParts extends QueryPart[]>(
  ...queryParts: QueryParts
): Or<QueryParts> {
  return { __or: queryParts };
}
