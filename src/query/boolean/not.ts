import type { NonBooleanQueryPart } from "../part.ts";

export type Not<QueryPart extends NonBooleanQueryPart> = {
   __not: QueryPart;
 };

export function not<QueryPart extends NonBooleanQueryPart>(
  queryPart: QueryPart
): Not<QueryPart> {
  return { __not: queryPart };
}
