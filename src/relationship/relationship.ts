import { Entity } from "../entity/index.ts";
import { type RelationshipComponent, RelationshipComponentStore, } from "./relationship-component-store.ts";
import { Component } from "../component/index.ts";
import { RelationshipInstanceQuery } from "./queries/relationship-instance-query.ts";
import type { Wildcard } from "../query/index.ts";
import { RelationshipWildcardQuery } from "./queries/relationship-wildcard-query.ts";
import { RelationshipTypeQuery } from "./queries/relationship-type-query.js";

export class Relationship<
  Value = undefined,
> extends Entity {

  static __relationshipComponents = new RelationshipComponentStore();


  static override as(name: string) {
    return new RelationshipWildcardQuery().as(name);
  }


  static override once() {
    return new RelationshipWildcardQuery().once();
  }

  static override type() {
    return new RelationshipTypeQuery();
  }


  static on(source: RelationshipSource) {
    return new RelationshipWildcardQuery().on(source);
  }


  static to(target: RelationshipTarget) {
    return new RelationshipWildcardQuery().to(target);
  }


  on(source: RelationshipSource): RelationshipInstanceQuery<typeof this> {
    return new RelationshipInstanceQuery(this).on(source);
  }


  to(entity: Entity): RelationshipComponent<this>;

  to(reference: RelationshipTarget): RelationshipInstanceQuery<typeof this>;

  to(
    entityOrReference: Entity | string | Wildcard,
  ): RelationshipComponent<this> | RelationshipInstanceQuery<typeof this> {
    if (entityOrReference instanceof Entity) {
      return this.#componentTo(entityOrReference);
    } else {
      return this.#queryTo(entityOrReference);
    }
  }


  #componentTo(entity: Entity): RelationshipComponent<this> {
    let relationshipComponent: RelationshipComponent<this> | null = (
      Relationship.__relationshipComponents.get(this, entity)
    );

    if (relationshipComponent === null) {
      let name = this.#getComponentName(this, entity);
      relationshipComponent = new Component<Value>(name) as RelationshipComponent<this>;
      Relationship.__relationshipComponents.set(this, entity, relationshipComponent);
    }

    return relationshipComponent;
  }


  #queryTo(reference: string | Wildcard): RelationshipInstanceQuery<typeof this> {
    return new RelationshipInstanceQuery(this).to(reference);
  }


  #getComponentName(relationship: Relationship<any>, entity: Entity): string | undefined {
    switch (true) {
      case !!relationship.name && !!entity.name:
        return `${relationship.name}->${entity.name}`;
      case !!relationship.name && !entity.name:
        return `${relationship.name}->?`;
      case !relationship.name && !!entity.name:
        return `?->${entity.name}`;
      default:
        return undefined;
    }
  }


  destroy() {
    Relationship.__relationshipComponents.delete(this);
    super.destroy();
  }
}


export type TagRelationship = Relationship<undefined>;

export type RelationshipTarget = string | Entity | Wildcard;
export type RelationshipSource = string | Entity | Wildcard;

export type RelationshipValue<RelationshipType extends Relationship<any>> = (
  RelationshipType extends Relationship<infer Value>
    ? Value
    : never
  );
