import type { NonBooleanQueryPart } from "../part.js";

export type Optional<QueryPart extends NonBooleanQueryPart> = {
   __optional: QueryPart;
 };

export function optional<QueryPart extends NonBooleanQueryPart>(
  queryPart: QueryPart
): Optional<QueryPart> {
  return { __optional: queryPart };
}
