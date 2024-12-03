/** @import { QueryPart } from "./part.js" */

/** @typedef {QueryArrayInput | QueryObjectInput} QueryInput */

/** @typedef {Array<QueryPart>} QueryArrayInput */

/** @typedef {Object<string, QueryPart>} QueryObjectInput */

/**
 * @template {QueryInput} Input
 * @typedef {(
 *    Input extends QueryArrayInput
 *      ? Input
 *      : Input extends QueryObjectInput
 *        ? [Input]
 *        : never
 * )} SpreadOrObjectQueryInput
 */

export {};