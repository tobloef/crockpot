import { NotImplementedError } from "./utils/errors/not-implemented-error.js";

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
 * @typedef {Brand<{}, "RefTargetCall">} RefTargetCall
 */

/**
 * @template {Relation<string, any>} T
 * @typedef {Brand<{}, "ComponentTargetCall">} ComponentTargetCall
 */

/**
 * @template {Relation<string, any>} T
 * @typedef {Brand<{}, "ComponentTypeTargetCall">} ComponentTypeTargetCall
 */

/**
 * @template {Relation<string, any>} T
 * @typedef {Brand<{}, "EntityTargetCall">} EntityTargetCall
 */

/**
 * @template {Relation<string, any>} T
 * @typedef {Brand<{}, "AnyComponentTargetCall">} AnyComponentTargetCall
 */

/**
 * @template {Relation<string, any>} T
 * @typedef {Brand<{}, "RelationTypeTargetCall">} RelationTypeTargetCall
 */

/**
 * @template {Relation<string, any>} T
 * @typedef {Brand<{}, "RelationTargetCall">} RelationTargetCall
 */

// TODO: Add relations (type and instance) to the possible methods below
/**
 * @template {string} Name
 * @template {RelationSchema | undefined} [Schema=undefined]
 * @typedef {(
 *   & ((target: Component<string, ComponentSchema>, values: Schema extends RelationSchema ? RelationValues<string, Schema> : undefined) => ComponentTargetCall<Relation<Name, Schema>>)
 *   & ((target: ComponentTypeObject<string, ComponentSchema | undefined>, values: Schema extends RelationSchema ? RelationValues<string, Schema> : undefined) => ComponentTypeTargetCall<Relation<Name, Schema>>)
 *   & ((target: Entity, values: Schema extends RelationSchema ? RelationValues<string, Schema> : undefined) => EntityTargetCall<Relation<Name, Schema>>)
 *   & ((target: RelationType<string, RelationSchema | undefined>, values: Schema extends RelationSchema ? RelationValues<string, Schema> : undefined) => RelationTypeTargetCall<Relation<Name, Schema>>)
 *   & ((target: Relation<string, RelationSchema>, values: Schema extends RelationSchema ? RelationValues<string, Schema> : undefined) => RelationTargetCall<Relation<Name, Schema>>)
 *   & ((target: string) => RefTargetCall<Relation<Name, Schema>>)
 *   & ((target: AnyComponent) => AnyComponentTargetCall<Relation<Name, Schema>>)
 * )} RelationTypeCallable
 */

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
     * @returns {RefTargetCall<Relation<Name, Schema>>}
     */

    /**
     * @overload
     * @param {Component<string, any>} source
     * @returns {ComponentTargetCall<Relation<Name, Schema>>}
     */

    /**
     * @overload
     * @param {ComponentTypeObject<string, any>} source
     * @returns {ComponentTypeTargetCall<Relation<Name, Schema>>}
     */

    /**
     * @overload
     * @param {Entity} source
     * @returns {EntityTargetCall<Relation<Name, Schema>>}
     */

    /**
     * @overload
     * @param {AnyComponent} source
     * @returns {AnyComponentTargetCall<Relation<Name, Schema>>}
     */

    /**
     * @param {(
     *   | Component<string, any>
     *   | ComponentTypeObject<string, any>
     *   | Entity
     *   | RelationType<string, Schema>
     *   | Relation<string, Schema>
     *   | string
     *   | AnyComponent
     * )} arg1
     * @returns {(
     *   | ComponentTargetCall<Relation<Name, Schema>>
     *   | ComponentTypeTargetCall<Relation<Name, Schema>>
     *   | EntityTargetCall<Relation<Name, Schema>>
     *   | RelationTypeTargetCall<Relation<Name, Schema>>
     *   | RelationTargetCall<Relation<Name, Schema>>
     *   | RefTargetCall<Relation<Name, Schema>>
     *   | AnyComponentTargetCall<Relation<Name, Schema>>
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
