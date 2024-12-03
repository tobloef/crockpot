/** @import { Class } from '../utils/class.js'; */
/** @import { Entity, EntityQuery } from '../entity/index.js'; */
/** @import { Component, ComponentQuery } from '../component/index.js'; */
/** @import { Relationship, RelationshipQuery } from '../relationship/index.js'; */
/** @import { Wildcard } from './wildcard.js'; */
/** @import { Not, Or, Optional } from './boolean/index.js'; */

/**
 * @typedef {(
 *   | NonBooleanQueryPart
 *   | BooleanQueryPart
 * )} QueryPart
 */

/**
 * @typedef {(
 *   | Class<Entity>
 *   | EntityQuery
 *   | Component<any>
 *   | ComponentQuery<any>
 *   | Relationship<any>
 *   | RelationshipQuery<any>
 *   | Wildcard
 * )} NonBooleanQueryPart
 */

/**
 * @typedef {(
 *   | Not<any>
 *   | Or<any>
 *   | Optional<any>
 * )} BooleanQueryPart
 */