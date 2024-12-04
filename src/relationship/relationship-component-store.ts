import type { Relationship } from "./relationship.js";
import type {
  Component,
  ComponentSchema,
  Schemaless,
} from "../component/index.js";
import type { Entity } from "../entity/index.js";

export class RelationshipComponentStore {
  #map = new Map<
    Relationship<ComponentSchema | Schemaless>,
    Map<Entity, Component<ComponentSchema | Schemaless>>
  >();


  set<
    Rel extends Relationship<Schema>,
    Schema extends ComponentSchema | Schemaless
  >(relationship: Rel, entity: Entity, component: Component<Schema>) {
    let entityMap = this.#map.get(relationship);

    if (!entityMap) {
      entityMap = new Map();
      this.#map.set(relationship, entityMap);
    }

    entityMap.set(entity, component);
  }


  get<
    Rel extends Relationship<Schema>,
    Schema extends ComponentSchema | Schemaless
  >(relationship: Rel, entity: Entity): Component<Schema> | undefined {
    const entityMap = this.#map.get(relationship);

    if (!entityMap) {
      return undefined;
    }

    return entityMap.get(entity) as Component<Schema> | undefined;
  }


  delete<Rel extends Relationship<ComponentSchema | Schemaless>>(
    relationship: Rel,
    entity: Entity
  ) {
    const entityMap = this.#map.get(relationship);

    if (entityMap) {
      entityMap.delete(entity);
    }
  }
}
