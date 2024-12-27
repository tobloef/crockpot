import type { RelationshipSource, RelationshipTarget, } from "../relationship.ts";
import { EntityWildcardQuery } from "../../entity/index.js";
import type { ComponentSource } from "../../component/index.js";
import { RelationshipWildcardValueQuery } from "./relationship-wildcard-value-query.js";

export class RelationshipWildcardQuery extends EntityWildcardQuery {
  source?: RelationshipSource;
  target?: RelationshipTarget;

  override as(name?: string): RelationshipWildcardQuery {
    super.as(name);
    return this;
  }


  override once(): RelationshipWildcardQuery {
    super.once();
    return this;
  }


  on(source: ComponentSource): RelationshipWildcardQuery {
    this.source = source;
    return this;
  }

  to(target: RelationshipTarget): RelationshipWildcardQuery {
    this.target = target;
    return this;
  }

  value(): RelationshipWildcardValueQuery {
    const valueQuery = new RelationshipWildcardValueQuery();

    valueQuery.typeName = this.name;
    valueQuery.isOnce = this.isOnce;
    valueQuery.source = this.source;
    valueQuery.target = this.target;

    return valueQuery;
  }
}
