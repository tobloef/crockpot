/** @import { ComponentType } from "../component/index.js"; */
/** @import { RelationshipType } from "../relationship/index.js"; */
/** @import { Entity } from "../entity/index.js"; */
/** @import { QueryComponent } from "./query-component.js"; */
/** @import { QueryRelationship } from "./query-relationship.js"; */
/** @import { QueryPart } from "./query-part.js"; */
/** @import { ClassesToInstances } from "../utils/class.js"; */
/** @import { Not, Or } from "./boolean/index.js"; */


/**
 * @template {QueryPart[]} QueryParts
 * @typedef {Array<{
 *   entity: Entity,
 *   components: ClassesToInstances<ParseQueryParts<QueryParts>>
 * }>} QueryResult
 */

/**
 * @template {any[]} QueryParts
 * @typedef {(
 *   QueryParts extends [infer First, ...infer Rest]
 *   ? First extends QueryPart
 *     ? [ParseQueryPart<First>] extends [never]
 *       ? ParseQueryParts<Rest>
 *       : [ParseQueryPart<First>, ...ParseQueryParts<Rest>]
 *     : never
 *   : []
 * )} ParseQueryParts
 */

/**
 * @template {QueryPart} Part
 * @typedef {(
 *   Part extends Not<any>
 *     ? never
 *     : Part extends Or<infer Types>
 *       ? ParseQueryPart<Types[number]>
 *       : Part extends ComponentType
 *         ? Part
 *         : Part extends QueryComponent<infer Type>
 *           ? Type
 *           : Part extends RelationshipType
 *             ? Part
 *             : Part extends QueryRelationship<infer Type>
 *               ? Type
 *               : never
 * )} ParseQueryPart
 */


export {}