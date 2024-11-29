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
export function or<T extends NonBooleanQueryPart[]>(...types: T): Or<T>;
/**
 * @template T
 * @param {any} value
 * @returns {value is Or<T>}
 */
export function isOr<T>(value: any): value is Or<T>;
export type Or<T extends NonBooleanQueryPart[]> = {
    __or: T;
};
import type { NonBooleanQueryPart } from "../query-part.js";
