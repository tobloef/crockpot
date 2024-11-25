/** @import { ComponentType } from "../component/index.js"; */
/** @import { RelationshipType } from "../relationship/index.js"; */
/** @import { QueryComponent } from "./query-component.js"; */
/** @import { QueryRelationship } from "./query-relationship.js"; */
/** @import { Not, Or } from "./boolean/index.js"; */

/**
 * @typedef {(
 *   | ComponentType
 *   | QueryComponent<any>
 *   | RelationshipType
 *   | QueryRelationship<any>
 *   | Not<any>
 *   | Or<any>
 * )} QueryPart
 */

/**
 * @typedef {(
 *   | ComponentType
 *   | QueryComponent<any>
 *   | RelationshipType
 *   | QueryRelationship<any>
 * )} NonBooleanQueryPart
 */

export {}