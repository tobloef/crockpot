import type { AnyRelationship } from "./relationship.ts";
import type { Entity } from "../entity/index.ts";
import type { Wildcard } from "../query/index.ts";
import type { Immutable } from "../utils/immutable.ts";

export class RelationshipQuery<Rel extends AnyRelationship> {
  #relationship: Rel;
  #source?: Entity | string;
  #target?: string | Entity | Wildcard;
  #name?: string;

  constructor(relationship: Rel) {
    this.#relationship = relationship;
  }


  get relationship(): Immutable<Rel> {
    return this.#relationship;
  }


  get source(): Immutable<Entity> | string | undefined {
    return this.#source;
  }


  get target(): string | Immutable<Entity> | Immutable<Wildcard> | undefined {
    return this.#target;
  }


  get name(): string | undefined {
    return this.#name;
  }


  on(source: Entity | string): RelationshipQuery<Rel> {
    this.#source = source;
    return this;
  }


  as(name: string): RelationshipQuery<Rel> {
    this.#name = name;
    return this;
  }


  to(target: string | Entity | Wildcard): RelationshipQuery<Rel> {
    this.#target = target;
    return this;
  }
}
