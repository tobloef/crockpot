import type { Entity } from "../entity/index.ts";
import type { Wildcard } from "../query/index.ts";
import type { Relationship } from "./relationship.ts";

export type Target = string | Entity | Wildcard;
export type Source = string | Entity | Wildcard;

export class RelationshipQuery<RelationshipType extends Relationship<any>> {
  #relationship: RelationshipType;
  #source?: Source;
  #target?: Target;
  #name?: string;
  #isOnce: boolean = false;


  constructor(relationship: RelationshipType) {
    this.#relationship = relationship;
  }


  get relationship(): RelationshipType {
    return this.#relationship;
  }


  get source(): Source | undefined {
    return this.#source;
  }


  get target(): Target | undefined {
    return this.#target;
  }


  get name(): string | undefined {
    return this.#name;
  }

  get isOnce(): boolean {
    return this.#isOnce;
  }


  on(source: Target): RelationshipQuery<RelationshipType> {
    this.#source = source;
    return this;
  }


  as(name: string): RelationshipQuery<RelationshipType> {
    this.#name = name;
    return this;
  }


  to(target: Target): RelationshipQuery<RelationshipType> {
    this.#target = target;
    return this;
  }

  once(): RelationshipQuery<RelationshipType> {
    this.#isOnce = true;
    return this;
  }
}
