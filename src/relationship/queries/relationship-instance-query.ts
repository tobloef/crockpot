import type {
  Relationship,
  RelationshipSource,
  RelationshipTarget,
} from "../relationship.ts";

export class RelationshipInstanceQuery<
  RelationshipType extends Relationship<any>,
> {
  relationship: RelationshipType;
  isOnce: boolean = false;
  source?: RelationshipSource;
  target?: RelationshipTarget;


  constructor(relationship: RelationshipType) {
    this.relationship = relationship;
  }


  once(): RelationshipInstanceQuery<RelationshipType> {
    this.isOnce = true;
    return this;
  }


  on(source: RelationshipSource): RelationshipInstanceQuery<RelationshipType> {
    this.source = source;
    return this;
  }


  to(target: RelationshipTarget): RelationshipInstanceQuery<RelationshipType> {
    this.target = target;
    return this;
  }
}
