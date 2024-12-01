/** @import { RelationshipType } from "../relationship/index.js"; */
/** @import { QueryAssociate } from "./query-associate.js"; */

/**
 * @template {RelationshipType} Type
 */
export class QueryRelationship {
  /** @type {Type} */
  #type;

  /** @type {QueryAssociate | undefined} owner */
  #owner;

  /** @type {QueryAssociate | undefined} target */
  #target;

  /**
   * @param {Type} type
   */
  constructor(type) {
    this.#type = type;
  }

  /**
   * @param {QueryAssociate} owner
   * @returns {this}
   */
  on(owner) {
    this.#owner = owner;
    return this;
  }

  /**
   * @param {QueryAssociate} target
   * @returns {this}
   */
  to(target) {
    this.#target = target;
    return this;
  }
}