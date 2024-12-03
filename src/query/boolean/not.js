/** @import { NonBooleanQueryPart } from "../part.js";

 /**
 * @template {NonBooleanQueryPart[]} QueryParts
 * @typedef {{
 *   __not: QueryParts
 * }} Not
 */

/**
 * @template {NonBooleanQueryPart[]} QueryParts
 * @param {QueryParts} queryParts
 * @returns {Not<QueryParts>}
 */
export function not(...queryParts) {
  return { __not: queryParts };
}