import type { AnyRelationship } from "./relationship.js";
import type { Entity } from "../entity/index.js";
import type { Wildcard } from "../query/index.js";
import { ComponentQuery } from "../component/query.js";

/**
 * @template {AnyRelationship} Rel
 * @extends {ComponentQuery<Rel>}
 */
export class RelationshipQuery<Rel extends AnyRelationship> extends ComponentQuery<Rel> {
  #target?: string | Entity | Wildcard;

  override on(source: Entity | string): RelationshipQuery<Rel> {
    super.on(source);
    return this;
  }

  override as(name: string): RelationshipQuery<Rel> {
    super.as(name);
    return this;
  }

  to(target: string | Entity | Wildcard): RelationshipQuery<Rel> {
    this.#target = target;
    return this;
  }
}
