import type { Entity } from "../entity/index.ts";
import type { Wildcard } from "../query/index.ts";
import type { Immutable } from "../utils/immutable.ts";
import type { Relationship } from "./relationship.ts";

export class RelationshipQuery<RelationshipType extends Relationship<any>> {
  #relationship: RelationshipType;
  #source?: Entity | string;
  #target?: string | Entity | Wildcard;
  #name?: string;


  constructor(relationship: RelationshipType) {
    this.#relationship = relationship;
  }


  get relationship(): Immutable<RelationshipType> {
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


  on(source: Entity | string): RelationshipQuery<RelationshipType> {
    this.#source = source;
    return this;
  }


  as(name: string): RelationshipQuery<RelationshipType> {
    this.#name = name;
    return this;
  }


  to(target: string | Entity | Wildcard): RelationshipQuery<RelationshipType> {
    this.#target = target;
    return this;
  }
}
