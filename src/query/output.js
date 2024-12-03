/** @import { QueryInput, QueryArrayInput, QueryObjectInput } from "./input.js" */
/** @import { QueryPart } from "./part.js" */
/** @import { Not, Optional, Or } from "./boolean/index.js" */
/** @import { Wildcard } from "./wildcard.js" */
/** @import { Component, ComponentQuery, Values } from "../component/index.js" */
/** @import { Entity, EntityQuery } from "../entity/index.js" */

/**
 * @template {QueryInput} Input
 * @typedef {(
 *   Input extends QueryArrayInput
 *     ? ParseQueryArrayInput<Input>
 *     : Input extends QueryObjectInput
 *       ? ParseQueryObjectInput<Input>
 *       : never
 * )} QueryOutput
 */

/**
 * @template {any[]} Input
 * @typedef {(
 *   Input extends [infer First, ...infer Rest]
 *     ? First extends QueryPart
 *       ? [ParseQueryPart<First>] extends [never]
 *         ? ParseQueryArrayInput<Rest>
 *         : [ParseQueryPart<First>, ...ParseQueryArrayInput<Rest>]
 *       : never
 *     : []
 *   )} ParseQueryArrayInput
 */

/**
 * @template {QueryObjectInput} Input
 * @typedef {{
 *   [Key in keyof Input]: ParseQueryPart<Input[Key]>
 * }} ParseQueryObjectInput
 */

/**
 * @template {QueryPart} Part
 * @typedef {(
 *   Part extends Optional<infer Type>
 *     ? (ParseQueryPart<Type> | undefined)
 *     : Part extends Not<any>
 *       ? never
 *       : Part extends Or<infer Types>
 *         ? ParseOr<Types> extends undefined
 *           ? never
 *           : ParseOr<Types>
 *         : Part extends ComponentQuery<infer Type>
 *           ? Type extends Component<infer Schema>
 *             ? Values<Schema>
 *             : never
 *           : Part extends Component<infer Schema>
 *             ? Values<Schema>
 *             : Part extends Entity
 *               ? Entity
 *               : Part extends Wildcard
 *                 ? Component<any>
 *                 : Part extends EntityQuery
 *                   ? Entity
 *                   : never
 *   )} ParseQueryPart
 */

/**
 * @template {any[]} Parts
 * @typedef {(
 *   Parts extends [infer First, ...infer Rest]
 *     ? First extends QueryPart
 *       ? ParseQueryPart<First> extends never
 *         ? (undefined | ParseOr<Rest>)
 *         : (ParseQueryPart<First> | ParseOr<Rest>)
 *       : never
 *     : never
 * )} ParseOr
 */

export {};