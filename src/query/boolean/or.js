/** @import { NonBooleanQueryPart } from "../part.js";

/**
 * @template {NonBooleanQueryPart[]} QueryParts
 * @typedef {{
 *   __or: QueryParts
 * }} Or
 */

/**
 * @template {NonBooleanQueryPart[]} QueryParts
 * @param {QueryParts} queryParts
 * @returns {Or<QueryParts>}
 */
export function or(...queryParts) {
  return { __or: queryParts };
}