import type { Relationship } from "./relationship.ts";
import type {
  Component,
  Schema,
  Schemaless,
} from "../component/index.ts";
import type { Entity } from "../entity/index.ts";

export class RelationshipComponentStore {
  #map = new Map<
    Relationship<any>,
    Map<Entity, Component<any>>
  >();


  set<
    Rel extends Relationship<RelationSchema>,
    RelationSchema extends Schema | Schemaless
  >(relationship: Rel, entity: Entity, component: Component<RelationSchema>) {
    let entityMap = this.#map.get(relationship);

    if (!entityMap) {
      entityMap = new Map();
      this.#map.set(relationship, entityMap);
    }

    entityMap.set(entity, component);
  }


  get<
    Rel extends Relationship<RelationSchema>,
    RelationSchema extends Schema | Schemaless
  >(relationship: Rel, entity: Entity): Component<RelationSchema> | undefined {
    const entityMap = this.#map.get(relationship);

    if (!entityMap) {
      return undefined;
    }

    return entityMap.get(entity) as Component<RelationSchema> | undefined;
  }


  delete(relationship: Relationship<Schema | Schemaless>) {
    this.#map.delete(relationship);
  }
}
