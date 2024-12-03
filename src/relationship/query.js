/** @import { AnyRelationship } from "./relationship.js"; */
/** @import { Entity } from "../entity/index.js"; */
/** @import { Wildcard } from "../query/index.js"; */

import { ComponentQuery } from "../component/query.js";

/**
 * @template {AnyRelationship} Rel
 * @extends {ComponentQuery<Rel>}
 */
export class RelationshipQuery extends ComponentQuery {
  /** @type {string | Entity | Wildcard | undefined} target */
  #target;

  /**
   * @override
   * @param {Entity | string} source
   * @returns {RelationshipQuery<Rel>}
   */
  on(source) {
    super.on(source);
    return this;
  }

  /**
   * @override
   * @param {string} name
   * @returns {RelationshipQuery<Rel>}
   */
  as(name) {
    super.as(name);
    return this;
  }

  /**
   * @param {string | Entity | Wildcard} target
   * @returns {RelationshipQuery<Rel>}
   */
  to(target) {
    this.#target = target;
    return this;
  }
}
