import type {
  Relationship,
  RelationshipSource,
  RelationshipTarget,
} from "../relationship.ts";
import { EntityInstanceQuery } from "../../entity/queries/entity-instance-query.ts";

export class RelationshipInstanceQuery<
  RelationshipType extends Relationship<any>,
> extends EntityInstanceQuery {
  declare entity: RelationshipType;
  source?: RelationshipSource;
  target?: RelationshipTarget;


  constructor(relationship: RelationshipType) {
    super(relationship);
  }


  get relationship(): RelationshipType {
    return this.entity;
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
