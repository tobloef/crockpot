import { EntityWildcardQuery } from "../entity/index.ts";
import { RelationshipTypeQuery } from "./relationship-type-query.ts";
import type { RelationshipSource, RelationshipTarget } from "./relationship.ts";

export class RelationshipWildcardQuery extends EntityWildcardQuery {
  #source?: RelationshipSource;
  #target?: RelationshipTarget;


  get source(): RelationshipSource | undefined {
    return this.#source;
  }

  get target(): RelationshipTarget | undefined {
    return this.#target;
  }


  override as(name: string): RelationshipWildcardQuery {
    super.as(name);
    return this;
  }

  override once(): RelationshipWildcardQuery {
    super.once();
    return this;
  }


  on(source: RelationshipSource): RelationshipWildcardQuery {
    this.#source = source;
    return this;
  }

  to(target: RelationshipTarget): RelationshipWildcardQuery {
    this.#target = target;
    return this;
  }

  override type() {
    const typeQuery = new RelationshipTypeQuery();

    if (this.source !== undefined) {
      typeQuery.on(this.source);
    }

    if (this.target !== undefined) {
      typeQuery.to(this.target);
    }

    if (this.name !== undefined) {
      typeQuery.as(this.name);
    }

    if (this.isOnce) {
      typeQuery.once();
    }

    return typeQuery;
  }
}
