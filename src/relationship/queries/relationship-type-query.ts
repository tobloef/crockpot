import { EntityTypeQuery } from "../../entity/queries/entity-type-query.ts";
import type { RelationshipSource, RelationshipTarget } from "../relationship.ts";

export class RelationshipTypeQuery extends EntityTypeQuery {
  #source?: RelationshipSource;
  #target?: RelationshipTarget;

  get source(): RelationshipSource | undefined {
    return this.#source;
  }

  get target(): RelationshipTarget | undefined {
    return this.#target;
  }

  as(name: string): RelationshipTypeQuery {
    super.as(name);
    return this;
  }

  once(): RelationshipTypeQuery {
    super.once();
    return this;
  }

  on(source: RelationshipSource): RelationshipTypeQuery {
    this.#source = source;
    return this;
  }

  to(target: RelationshipTarget): RelationshipTypeQuery {
    this.#target = target;
    return this;
  }
}