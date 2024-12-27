import type {
  RelationshipSource,
  RelationshipTarget,
} from "../relationship.ts";

export class RelationshipWildcardQuery {
  isOnce: boolean = false;
  source?: RelationshipSource;
  target?: RelationshipTarget;


  once(): RelationshipWildcardQuery {
    this.isOnce = true;
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
