/** @import { Component, ComponentType } from "../component/index.js" */
/** @import { Relationship } from "../relationship/index.js" */

/**
 * @typedef {(
 *   | ComponentType
 *   | Component
 *   | Relationship
 * )} Association
 */

export class Entity {
  /**
   * @param {Association[]} associations
   */
  constructor(...associations) {

  }
}
