import { Entity } from "../entity/index.ts";
import { RelationshipComponentStore } from "./relationship-component-store.ts";
import type {
  Schema,
  Schemaless,
} from "../component/index.ts";
import { Component } from "../component/index.ts";
import { Wildcard } from "../query/wildcard.ts";
import { RelationshipQuery } from "./query.ts";
import type { Immutable } from "../utils/immutable.ts";

export type TagRelationship = Relationship<Schemaless>;
export type RelationshipWithValue = Relationship<Schema>;

export class Relationship<
  RelationSchema extends Schema | Schemaless = Schemaless
> extends Entity {

  static __relationshipComponents = new RelationshipComponentStore();

  #schema: RelationSchema;


  constructor();

  constructor(name: string);

  constructor(schema: RelationSchema);

  constructor(name: string, schema: RelationSchema);

  constructor(name: string | undefined, schema: RelationSchema | undefined);

  constructor(nameOrSchema?: string | RelationSchema, schemaOrUndefined?: RelationSchema) {
    const name = typeof nameOrSchema === "string" ? nameOrSchema : undefined;
    const schema = typeof nameOrSchema === "string" ? schemaOrUndefined : nameOrSchema;

    super(name);
    this.#schema = schema as RelationSchema;
  }


  get schema(): Immutable<RelationSchema> {
    return this.#schema;
  }


  to(entity: Entity): Component<RelationSchema>;

  to(reference: string | Wildcard): RelationshipQuery<typeof this>;

  to(entityOrReference: Entity | string | Wildcard): Component<RelationSchema> | RelationshipQuery<typeof this> {
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


  #componentTo(entity: Entity): Component<RelationSchema> {
    let relationshipComponent: Component<RelationSchema> | undefined = (
      Relationship.__relationshipComponents.get(this, entity)
    );

    if (relationshipComponent === undefined) {
      let name = this.#getComponentName(this, entity);
      relationshipComponent = new Component<RelationSchema>(name, this.#schema as RelationSchema);
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
