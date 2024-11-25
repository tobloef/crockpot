/** @import { NonBooleanQueryPart } from "../query-part.js" */

/**
 * @template T
 * @typedef {Object} Not
 * @property {T} __not
 */

/**
 * @template {NonBooleanQueryPart} T
 * @param {T} type
 * @returns {Not<T>}
 */
export function not(type) {
  return { __not: type };
}

/**
 * @template {NonBooleanQueryPart} T
 * @param {any} value
 * @returns {value is Not<T>}
 */
export function isNot(value) {
  return value && typeof value === 'object' && '__not' in value;
}
