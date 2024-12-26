import type { Relationship } from "./relationship.ts";
import type { Component } from "../component/index.ts";
import type { Entity } from "../entity/index.ts";

export class RelationshipComponentStore {
  #map = new Map<
    Relationship<any>,
    Map<Entity, Component<any>>
  >();


  set<
    RelationshipType extends Relationship<Value>,
    Value
  >(
    relationship: RelationshipType,
    entity: Entity,
    component: Component<Value>,
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
    entity: Entity,
  ): RelationshipType extends Relationship<infer Value> ? Component<Value> | null : never {
    const entityMap = this.#map.get(relationship);

    if (!entityMap) {
      return null as any;
    }

    return (entityMap.get(entity) ?? null) as any;
  }


  delete(relationship: Relationship<any>) {
    this.#map.delete(relationship);
  }
}
