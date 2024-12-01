/** @import { Class } from "../utils/class.js" */
/** @import { Entity } from "../entity/index.js"; */
/** @import { ComponentType, Component } from "../component/index.js" */
/** @import { QueryAssociate } from "../query/index.js" */
/** @import { Association } from "../association.js" */

import { QueryRelationship } from "../query/index.js";

/** @typedef {Class<Relationship>} RelationshipType */

/**
 * @typedef {(
 *   | Entity
 *   | ComponentType
 *   | Component
 *   | RelationshipType
 *   | Relationship
 * )} Target
 */

/** @abstract */
export class Relationship {
  #brand = Relationship.name;

  /**
   * @param {Target} target
   */
  constructor(target) {
  }

  /**
   * @template {Class<Relationship>} Type
   * @this {Type}
   * @param {QueryAssociate} owner
   * @returns {QueryRelationship<Type>}
   */
  static on(owner) {
    return new QueryRelationship(this).on(owner);
  }

  /**
   * @template {Class<Relationship>} Type
   * @this {Type}
   * @param {QueryAssociate} target
   * @returns {QueryRelationship<Type>}
   */
  static to(target) {
    return new QueryRelationship(this).to(target);
  }

  /**
   * @param {Association[]} associations
   */
  add(...associations) {

  }
}
