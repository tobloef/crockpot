/** @import { NonBooleanQueryPart } from "../part.js";

 /**
 * @template {NonBooleanQueryPart} QueryParts
 * @typedef {{
 *   __optional: QueryParts
 * }} Optional
 */

/**
 * @template {NonBooleanQueryPart[]} QueryParts
 * @param {QueryParts} queryParts
 * @returns {Optional<QueryParts>}
 */
export function optional(...queryParts) {
  return { __optional: queryParts };
}