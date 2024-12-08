import type { Relationship } from "./relationship.ts";
import type {
  Component,
} from "../component/index.ts";
import type { Entity } from "../entity/index.ts";

export type RelationshipComponent<RelationshipType extends Relationship<any>> = (
  RelationshipType extends Relationship<infer Value>
    ? Component<Value>
    : never
)

export class RelationshipComponentStore {
  #map = new Map<
    Relationship<any>,
    Map<Entity, Component<any>>
  >();


  set<
    RelationshipType extends Relationship<any>
  >(
    relationship: RelationshipType,
    entity: Entity,
    component: RelationshipComponent<RelationshipType>
  ) {
    let entityMap = this.#map.get(relationship);

    if (!entityMap) {
      entityMap = new Map();
      this.#map.set(relationship, entityMap);
    }

    entityMap.set(entity, component);
  }


  get<
    RelationshipType extends Relationship<any>
  >(
    relationship: RelationshipType,
    entity: Entity
  ): RelationshipComponent<RelationshipType> | null {
    const entityMap = this.#map.get(relationship);

    if (!entityMap) {
      return null;
    }

    return (
      entityMap.get(entity) ?? null
    ) as RelationshipComponent<RelationshipType> | null;
  }


  delete(relationship: Relationship<any>) {
    this.#map.delete(relationship);
  }
}
