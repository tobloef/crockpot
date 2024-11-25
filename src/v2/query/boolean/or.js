/** @import { NonBooleanQueryPart } from "../query-part.js" */

/**
 * @template {NonBooleanQueryPart[]} T
 * @typedef {Object} Or
 * @property {T} __or
 */

/**
 * @template {NonBooleanQueryPart[]} T
 * @param {T} types
 * @returns {Or<T>}
 */
export function or(...types) {
  return { __or: types };
}

/**
 * @template T
 * @param {any} value
 * @returns {value is Or<T>}
 */
export function isOr(value) {
  return value && typeof value === 'object' && '__or' in value;
}