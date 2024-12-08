import { Entity } from "../entity/index.ts";
import {
  type RelationshipComponent,
  RelationshipComponentStore,
} from "./relationship-component-store.ts";
import { Component } from "../component/index.ts";
import { Wildcard } from "../query/wildcard.ts";
import { RelationshipQuery } from "./query.ts";

export class Relationship<
  Value = undefined,
> extends Entity {

  static __relationshipComponents = new RelationshipComponentStore();


  to(entity: Entity): RelationshipComponent<this>;

  to(reference: string | Wildcard): RelationshipQuery<typeof this>;

  to(
    entityOrReference: Entity | string | Wildcard,
  ): RelationshipComponent<this> | RelationshipQuery<typeof this> {
    if (typeof entityOrReference === "string" || entityOrReference instanceof Wildcard) {
      return this.#queryTo(entityOrReference);
    } else {
      return this.#componentTo(entityOrReference);
    }
  }


  on(source: string | Entity): RelationshipQuery<typeof this> {
    return new RelationshipQuery(this).on(source);
  }


  as(name: string): RelationshipQuery<typeof this> {
    return new RelationshipQuery(this).as(name);
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


  #queryTo(reference: string | Wildcard): RelationshipQuery<typeof this> {
    return new RelationshipQuery(this).to(reference);
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

export type RelationshipValue<RelationshipType extends Relationship<any>> = (
  RelationshipType extends Relationship<infer Value>
    ? Value
    : never
);
