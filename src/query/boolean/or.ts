import type { NonBooleanQueryPart } from "../part.ts";

export type Or<QueryParts extends NonBooleanQueryPart[]> = {
  __or: QueryParts;
};

export function or<QueryParts extends NonBooleanQueryPart[]>(
  ...queryParts: QueryParts
): Or<QueryParts> {
  return {__or: queryParts};
}
