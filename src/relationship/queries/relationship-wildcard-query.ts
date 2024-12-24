import { EntityWildcardQuery } from "../../entity/index.ts";
import type { RelationshipSource, RelationshipTarget } from "../relationship.ts";

export class RelationshipWildcardQuery extends EntityWildcardQuery {
  source?: RelationshipSource;
  target?: RelationshipTarget;

  override as(name: string): RelationshipWildcardQuery {
    super.as(name);
    return this;
  }

  override once(): RelationshipWildcardQuery {
    super.once();
    return this;
  }

  on(source: RelationshipSource): RelationshipWildcardQuery {
    this.source = source;
    return this;
  }

  to(target: RelationshipTarget): RelationshipWildcardQuery {
    this.target = target;
    return this;
  }
}
