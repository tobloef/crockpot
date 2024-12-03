import { Component } from "../component/index.js";
import { Wildcard } from "../query/wildcard.js";
import { RelationshipQuery } from "./query.js";

/** @import { ComponentSchema, Schemaless, AnyComponent } from "../component/index.js"; */
/** @import { Entity } from "../entity/index.js"; */

/** @typedef {Relationship<ComponentSchema | Schemaless>} AnyRelationship */

/**
 * @template {ComponentSchema | Schemaless} [Schema=Schemaless]
 * @extends {Component<Schema>}
 */
export class Relationship extends Component {
  /** @type {Map<AnyRelationship, Map<Entity, AnyComponent>>} */
  static relationshipComponents = new Map();

  /**
   * @overload
   * @param {Entity} entity
   * @returns {Component<Schema>}
   */

  /**
   * @overload
   * @param {string | Wildcard} reference
   * @returns {RelationshipQuery<typeof this>}
   */

  /**
   * @param {Entity | string | Wildcard} entityOrReference
   * @returns {Component<Schema> | RelationshipQuery<typeof this>}
   */
  to(entityOrReference) {
    if (typeof entityOrReference === "string" || entityOrReference instanceof Wildcard) {
      return this.#toQuery(entityOrReference);
    } else {
      return this.#toComponent(entityOrReference);
    }
  }

  /**
   * @param {string | Entity} source
   * @returns {RelationshipQuery<typeof this>}
   */
  on(source) {
    return new RelationshipQuery(this).on(source);
  }

  /**
   * @param {string} name
   * @returns {RelationshipQuery<typeof this>}
   */
  as(name) {
    return new RelationshipQuery(this).as(name);
  }

  /**
   * @param {Entity} entity
   * @returns {Component<Schema>}
   */
  #toComponent(entity) {

    let entityToComponentMap = (
      /** @type {Map<Entity, Component<Schema>>} */
      (Relationship.relationshipComponents.get(this))
    );
    if (entityToComponentMap === undefined) {
      entityToComponentMap = new Map();
      Relationship.relationshipComponents.set(this, entityToComponentMap);
    }

    /** @type {Component<Schema> | undefined} */
    let relationshipComponent = entityToComponentMap.get(entity);
    if (relationshipComponent === undefined) {
      relationshipComponent = new Component(
        /** @type {any} */
        (this.schema)
      );
    }

    return relationshipComponent;
  }

  /**
   *
   * @param {string | Wildcard} reference
    * @returns {RelationshipQuery<typeof this>}
   */
  #toQuery(reference) {
    return new RelationshipQuery(this).to(reference);
  }
}