import {
  Component,
} from "../component/index.js";
import { Wildcard } from "../query/wildcard.js";
import { RelationshipQuery } from "./query.js";
import type { ComponentSchema, Schemaless } from "../component/index.js";
import type { Entity } from "../entity/index.js";
import { RelationshipComponentStore } from "./relationship-component-store.js";

export type AnyRelationship = Relationship<ComponentSchema | Schemaless>;

export class Relationship<
  Schema extends ComponentSchema | Schemaless = Schemaless
> extends Component<Schema> {
  static relationshipComponents = new RelationshipComponentStore();


  to(entity: Entity): Component<Schema>;

  to(reference: string | Wildcard): RelationshipQuery<typeof this>;

  to(entityOrReference: Entity | string | Wildcard): Component<Schema> | RelationshipQuery<typeof this> {
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

  #componentTo(entity: Entity): Component<Schema> {
    let relationshipComponent: Component<Schema> | undefined = (
      Relationship.relationshipComponents.get(this, entity)
    );

    if (relationshipComponent === undefined) {
      relationshipComponent = new Component<Schema>(this.schema as Schema);
      Relationship.relationshipComponents.set(this, entity, relationshipComponent);
    }

    return relationshipComponent;
  }

  #queryTo(reference: string | Wildcard): RelationshipQuery<typeof this> {
    return new RelationshipQuery(this).to(reference);
  }
}
