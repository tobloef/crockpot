import type {
  RelationshipSource,
  RelationshipTarget,
} from "../relationship.ts";

export class RelationshipWildcardValueQuery {
  typeName?: string;
  isOnce: boolean = false;
  source?: RelationshipSource;
  target?: RelationshipTarget;

  as(typeName?: string): RelationshipWildcardValueQuery {
    this.typeName = typeName;
    return this;
  }


  once(): RelationshipWildcardValueQuery {
    this.isOnce = true;
    return this;
  }


  on(source: RelationshipSource): RelationshipWildcardValueQuery {
    this.source = source;
    return this;
  }

  to(target: RelationshipTarget): RelationshipWildcardValueQuery {
    this.target = target;
    return this;
  }
}
