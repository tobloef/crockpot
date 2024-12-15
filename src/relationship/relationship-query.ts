import type { Relationship, RelationshipSource, RelationshipTarget } from "./relationship.ts";
import type { Class } from "../utils/class.ts";
import { EntityQuery } from "../entity/entity-query.ts";

export class RelationshipQuery<
  RelationshipType extends Relationship<any> | Class<Relationship<any>>,
> extends EntityQuery {
  #relationship: RelationshipType;
  #source?: RelationshipSource;
  #target?: RelationshipTarget;


  constructor(relationship: RelationshipType) {
    super();
    this.#relationship = relationship;
  }


  get relationship(): RelationshipType {
    return this.#relationship;
  }


  get source(): RelationshipSource | undefined {
    return this.#source;
  }


  get target(): RelationshipTarget | undefined {
    return this.#target;
  }


  override as(name: string): RelationshipQuery<RelationshipType> {
    super.as(name);
    return this;
  }


  override once(): RelationshipQuery<RelationshipType> {
    super.once();
    return this;
  }


  on(source: RelationshipSource): RelationshipQuery<RelationshipType> {
    this.#source = source;
    return this;
  }


  to(target: RelationshipTarget): RelationshipQuery<RelationshipType> {
    this.#target = target;
    return this;
  }
}
