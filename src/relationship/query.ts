import type { AnyRelationship } from "./relationship.ts";
import type { Entity } from "../entity/index.ts";
import type { Wildcard } from "../query/index.ts";
import type { Immutable } from "../utils/immutable.ts";

export class RelationshipQuery<Relationship extends AnyRelationship> {
  #relationship: Relationship;
  #source?: Entity | string;
  #target?: string | Entity | Wildcard;
  #name?: string;

  constructor(relationship: Relationship) {
    this.#relationship = relationship;
  }


  get relationship(): Immutable<Relationship> {
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


  on(source: Entity | string): RelationshipQuery<Relationship> {
    this.#source = source;
    return this;
  }


  as(name: string): RelationshipQuery<Relationship> {
    this.#name = name;
    return this;
  }


  to(target: string | Entity | Wildcard): RelationshipQuery<Relationship> {
    this.#target = target;
    return this;
  }
}
