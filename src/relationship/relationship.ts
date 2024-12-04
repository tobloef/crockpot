import {
  Component,
} from "../component/index.js";
import { Wildcard } from "../query/wildcard.js";
import { RelationshipQuery } from "./query.js";
import type { ComponentSchema, Schemaless } from "../component/index.js";
import { Entity } from "../entity/index.js";
import { RelationshipComponentStore } from "./relationship-component-store.js";
import type { Immutable } from "../utils/immutable.js";

export type AnyRelationship = Relationship<ComponentSchema | Schemaless>;
export type TagRelationship = Relationship<Schemaless>;
export type RelationshipWithValue = Relationship<ComponentSchema>;

export class Relationship<
  Schema extends ComponentSchema | Schemaless = Schemaless
> extends Entity {

  static __relationshipComponents = new RelationshipComponentStore();

  #schema: Schema;

  constructor()
  constructor(name: string)
  constructor(schema: Schema)
  constructor(name: string, schema: Schema)
  constructor(name: string | undefined, schema: Schema | undefined)
  constructor(nameOrSchema?: string | Schema, schemaOrUndefined?: Schema) {
    const name = typeof nameOrSchema === "string" ? nameOrSchema : undefined;
    const schema = typeof nameOrSchema === "string" ? schemaOrUndefined : nameOrSchema;

    super(name);
    this.#schema = schema as Schema;
  }


  get schema(): Immutable<Schema> {
    return this.#schema;
  }


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
      Relationship.__relationshipComponents.get(this, entity)
    );

    if (relationshipComponent === undefined) {
      let name = this.#getComponentName(this, entity);
      relationshipComponent = new Component<Schema>(name, this.#schema as Schema);
      Relationship.__relationshipComponents.set(this, entity, relationshipComponent);
    }

    return relationshipComponent;
  }

  #queryTo(reference: string | Wildcard): RelationshipQuery<typeof this> {
    return new RelationshipQuery(this).to(reference);
  }

  #getComponentName(relationship: Relationship<any>, entity: Entity): string | undefined {
    switch (true) {
      case !!relationship.name && !!entity.name: return `${relationship.name}->${entity.name}`;
      case !!relationship.name && !entity.name: return `${relationship.name}->?`;
      case !relationship.name && !!entity.name: return `?->${entity.name}`;
      default: return undefined;
    }
  }

  destroy() {
    Relationship.__relationshipComponents.delete(this);
    super.destroy();
  }
}
