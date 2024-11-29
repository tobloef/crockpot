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
export function not<T extends NonBooleanQueryPart>(type: T): Not<T>;
/**
 * @template {NonBooleanQueryPart} T
 * @param {any} value
 * @returns {value is Not<T>}
 */
export function isNot<T extends NonBooleanQueryPart>(value: any): value is Not<T>;
export type Not<T> = {
    __not: T;
};
import type { NonBooleanQueryPart } from "../query-part.js";
