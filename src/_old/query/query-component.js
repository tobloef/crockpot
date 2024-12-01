/** @import { ComponentType } from "../component/index.js"; */
/** @import { QueryAssociate } from "./query-associate.js"; */

/**
 * @template {ComponentType} Type
 */
export class QueryComponent {
  /** @type {Type} */
  #componentType;

  /** @type {QueryAssociate | undefined} owner */
  #owner;

  /**
   * @param {Type} componentType
   */
  constructor(componentType) {
    this.#componentType = componentType;
  }

  /**
   * @param {QueryAssociate} owner
   * @returns {this}
   */
  on(owner) {
    this.#owner = owner;
    return this;
  }
}