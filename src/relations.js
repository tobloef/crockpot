/** @import { DataType, DataTypeToType } from "./data-type.js"; */
/** @import { Entity } from "./entity.js"; */
/** @import { Brand } from "./utils/brand.js"; */
/** @import { Component, ComponentTypeObject, AnyComponent, ComponentSchema } from "./components.js"; */

/**
 * @typedef {Record<string, DataType>} RelationSchema
 */

/**
 * @template {string} Name
 * @template {RelationSchema | undefined} [Schema=undefined]
 * @typedef {Schema extends RelationSchema ? Brand<{
 *   [Key in keyof Schema]: DataTypeToType<Schema[Key]>
 * }, "Relation"> : never} Relation
 */

/**
 * @template {RelationTypeObject<string, RelationSchema>[]} RelationTypes
 * @typedef {{
 *   [Index in keyof RelationTypes]: RelationTypes[Index] extends RelationTypeObject<infer Name, infer Schema>
 *     ? Relation<Name, Schema>
 *     : never
 * }} RelationTypesToRelations
 */

/**
 * @template {string} Name
 * @template {RelationSchema | undefined} [Schema=undefined]
 * @typedef {(
 *   & RelationTypeObject<Name, Schema>
 *   & RelationTypeCallable<Name, Schema>
 * )} RelationType
 */

/**
 * @template {string} Name
 * @template {ComponentSchema | undefined} [Schema=undefined]
 * @typedef {Object} RelationTypeObject
 * @property {Name} name
 * @property {Schema extends RelationSchema ? Schema : undefined} schema
 * @property {(...components: Array<
 *   | Component<string, ComponentSchema>
 * >) => void} add
 */

/**
 * @template {string} Name
 * @template {RelationSchema | undefined} [Schema=undefined]
 * @typedef {Schema extends RelationSchema ? ({
 *   [Key in keyof Schema]: DataTypeToType<Schema[Key]>
 * }) : never} RelationValues
 */

/**
 * @template {Relation<string, any>} T
 * @typedef {Brand<{}, "RefSourceCall">} RefSourceCall
 */

/**
 * @template {Relation<string, any>} T
 * @typedef {Brand<{}, "ComponentSourceCall">} ComponentSourceCall
 */

/**
 * @template {Relation<string, any>} T
 * @typedef {Brand<{}, "ComponentTypeSourceCall">} ComponentTypeSourceCall
 */

/**
 * @template {Relation<string, any>} T
 * @typedef {Brand<{}, "EntitySourceCall">} EntitySourceCall
 */

/**
 * @template {Relation<string, any>} T
 * @typedef {Brand<{}, "AnyComponentSourceCall">} AnyComponentSourceCall
 */

// TODO: Add relations (type and instance) to the possible methods below
/**
 * @template {string} Name
 * @template {RelationSchema | undefined} [Schema=undefined]
 * @typedef {(
 *   & ((source: string) => RefSourceCall<Relation<Name, Schema>>)
 *   & ((source: Component<string, any>) => ComponentSourceCall<Relation<Name, Schema>>)
 *   & ((source: ComponentTypeObject<string, any>) => ComponentTypeSourceCall<Relation<Name, Schema>>)
 *   & ((source: Entity) => EntitySourceCall<Relation<Name, Schema>>)
 *   & ((source: AnyComponent) => AnyComponentSourceCall<Relation<Name, Schema>>)
 *   & ((values: RelationValues<Name, Schema>) => Relation<Name, Schema>)
 * )} RelationTypeCallable
 */

import { NotImplementedError } from "./utils/errors/not-implemented-error.js";

/**
 * @typedef {Brand<{}, "RelationWildcard">} RelationWildcard
 */

export const AnyRelation = /** @type {RelationWildcard} */ ({});

export class Relations {
  /**
   * @template {string} Name
   * @template {RelationSchema | undefined} [Schema=undefined]
   * @param {Name} name
   * @param {Schema} [schema]
   * @returns {RelationType<Name, Schema extends RelationSchema ? Schema : undefined>}
   */
  define(name, schema) {
    /**
     * @param {Array<
     *   | Component<string, ComponentSchema>
     * >} components
     * @returns {void}
     */
    function add(...components) {
      throw new NotImplementedError()
    }

    /** @type {Omit<RelationTypeObject<Name, Schema>, "name">} */
    const relationTypeObject = {
      schema: (
        /** @type {Schema extends RelationSchema ? Schema : undefined} */
        (schema)
      ),
      add,
    };

    /**
     * @template {RelationValues<Name, Schema>} Values
     * @overload
     * @param {Values extends Relation<Name, Schema> ? never : Values} values
     * @returns {Values extends Relation<Name, Schema> ? never : Values}
     */

    /**
     * @overload
     * @param {string} source
     * @returns {RefSourceCall<Relation<Name, Schema>>}
     */

    /**
     * @overload
     * @param {Component<string, any>} source
     * @returns {ComponentSourceCall<Relation<Name, Schema>>}
     */

    /**
     * @overload
     * @param {ComponentTypeObject<string, any>} source
     * @returns {ComponentTypeSourceCall<Relation<Name, Schema>>}
     */

    /**
     * @overload
     * @param {Entity} source
     * @returns {EntitySourceCall<Relation<Name, Schema>>}
     */

    /**
     * @overload
     * @param {AnyComponent} source
     * @returns {AnyComponentSourceCall<Relation<Name, Schema>>}
     */

    /**
     * @param {(
     *   | string
     *   | Component<string, any>
     *   | ComponentTypeObject<string, any>
     *   | Entity
     *   | AnyComponent
     *   | RelationValues<Name, Schema>
     * )} arg1
     * @returns {(
     *   | RefSourceCall<Relation<Name, Schema>>
     *   | ComponentSourceCall<Relation<Name, Schema>>
     *   | ComponentTypeSourceCall<Relation<Name, Schema>>
     *   | EntitySourceCall<Relation<Name, Schema>>
     *   | AnyComponentSourceCall<Relation<Name, Schema>>
     *   | Relation<Name, Schema>
     * )}
     */
    function relationType(arg1) {
      throw new NotImplementedError();
    }

    /**
     * @type {RelationTypeCallable<Name, Schema>}
     */
    const relationTypeCallable = relationType;

    Object.assign(relationTypeCallable, relationTypeObject);
    Object.defineProperty(relationTypeCallable, "name", { value: name });

    return (
      /** @type {RelationType<Name, Schema extends RelationSchema ? Schema : undefined>} */
      (relationTypeCallable)
    );
  }
}
