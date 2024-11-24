/** @import { DataType, DataTypeToType } from "./data-type.js"; */
/** @import { Entity } from "./entity.js"; */
/** @import { Brand } from "./utils/brand.js"; */

/**
 * @typedef {Record<string, DataType>} ComponentSchema
 */

/**
 * @template {string} Name
 * @typedef {ComponentType<Name>} TagComponentType
 */

/**
 * @template {string} Name
 * @template {ComponentSchema | undefined} [Schema=undefined]
 * @typedef {Schema extends ComponentSchema ? Brand<{
 *   [Key in keyof Schema]: DataTypeToType<Schema[Key]>
 * }, "Component"> : never} Component
 */

/**
 * @template {ComponentTypeObject<string, ComponentSchema>[]} ComponentTypes
 * @typedef {{
 *   [Index in keyof ComponentTypes]: ComponentTypes[Index] extends ComponentTypeObject<infer Name, infer Schema>
 *     ? Component<Name, Schema>
 *     : never
 * }} ComponentTypesToComponents
 */

/**
 * @template {string} Name
 * @template {ComponentSchema | undefined} [Schema=undefined]
 * @typedef {(
 *   & ComponentTypeObject<Name, Schema>
 *   & ComponentTypeCallable<Name, Schema>
 * )} ComponentType
 */

/**
 * @template {Component<string, any>} T
 * @typedef {Brand<{}, "RefSourceCall">} RefSourceCall
 */

/**
 * @template {Component<string, any>} T
 * @typedef {Brand<{}, "ComponentSourceCall">} ComponentSourceCall
 */

/**
 * @template {Component<string, any>} T
 * @typedef {Brand<{}, "ComponentTypeSourceCall">} ComponentTypeSourceCall
 */

/**
 * @template {Component<string, any>} T
 * @typedef {Brand<{}, "EntitySourceCall">} EntitySourceCall
 */

/**
 * @template {Component<string, any>} T
 * @typedef {Brand<{}, "AnyComponentSourceCall">} AnyComponentSourceCall
 */

/**
 * @template {string} Name
 * @template {ComponentSchema | undefined} [Schema=undefined]
 * @typedef {Object} ComponentTypeObject
 * @property {Name} name
 * @property {Schema} [schema]
 * @property {(...components: Array<
 *   | Component<string, ComponentSchema>
 *   | TagComponentType<string>
 * >) => void} add
 */

/**
 * @template {string} Name
 * @template {ComponentSchema | undefined} [Schema=undefined]
 * @typedef {Schema extends ComponentSchema ? ({
 *   [Key in keyof Schema]: DataTypeToType<Schema[Key]>
 * }) : never} ComponentValues
 */

/**
 * @template {string} Name
 * @template {ComponentSchema | undefined} [Schema=undefined]
 * @typedef {(
 *   & ((values: ComponentValues<Name, Schema>) => Component<Name, Schema>)
 *   & ((source: string) => RefSourceCall<Component<Name, Schema>>)
 *   & ((source: Component<string, any>) => ComponentSourceCall<Component<Name, Schema>>)
 *   & ((source: ComponentTypeObject<string, any>) => ComponentTypeSourceCall<Component<Name, Schema>>)
 *   & ((source: Entity) => EntitySourceCall<Component<Name, Schema>>)
 *   & ((source: AnyComponent) => AnyComponentSourceCall<Component<Name, Schema>>)
 * )} ComponentTypeCallable
 */

import { NotImplementedError } from "./utils/errors/not-implemented-error.js";

/**
 * @typedef {Brand<{}, "ComponentWildcard">} ComponentWildcard
 */

export const AnyComponent = /** @type {ComponentWildcard} */ ({});

export class Components {
  /**
   * @template {string} Name
   * @template {ComponentSchema | undefined} [Schema=undefined]
   * @param {Name} name
   * @param {Schema} [schema]
   * @returns {ComponentType<Name, Schema extends ComponentSchema ? Schema : undefined>}
   */
  define(name, schema) {
    /**
     * @param {Array<
     *   | Component<string, ComponentSchema>
     *   | TagComponentType<string>
     * >} components
     * @returns {void}
     */
    function add(...components) {
      throw new NotImplementedError()
    }

    /** @type {Omit<ComponentTypeObject<Name, Schema>, "name">} */
    const componentTypeObject = {
      schema,
      add,
    };

    /**
     * @template {ComponentValues<Name, Schema>} Values
     * @overload
     * @param {Values extends Component<Name, Schema> ? never : Values} values
     * @returns {Values extends Component<Name, Schema> ? never : Values}
     */

    /**
     * @overload
     * @param {string} source
     * @returns {RefSourceCall<Component<Name, Schema>>}
     */

    /**
     * @overload
     * @param {Component<string, any>} source
     * @returns {ComponentSourceCall<Component<Name, Schema>>}
     */

    /**
     * @overload
     * @param {ComponentTypeObject<string, any>} source
     * @returns {ComponentTypeSourceCall<Component<Name, Schema>>}
     */

    /**
     * @overload
     * @param {Entity} source
     * @returns {EntitySourceCall<Component<Name, Schema>>}
     */

    /**
     * @overload
     * @param {AnyComponent} source
     * @returns {AnyComponentSourceCall<Component<Name, Schema>>}
     */

    /**
     * @param {(
     *   | ComponentValues<Name, Schema>
     *   | string
     *   | Component<string, any>
     *   | ComponentTypeObject<string, any>
     *   | Entity
     *   | AnyComponent
     * )} arg1
     * @returns {(
     *   | Component<Name, Schema>
     *   | RefSourceCall<Component<Name, Schema>>
     *   | ComponentSourceCall<Component<Name, Schema>>
     *   | ComponentTypeSourceCall<Component<Name, Schema>>
     *   | EntitySourceCall<Component<Name, Schema>>
     *   | AnyComponentSourceCall<Component<Name, Schema>>
     * )}
     */
    function componentType(arg1) {
      return /** @type {Component<Name, Schema>} */ (arg1);
    }

    /**
     * @type {ComponentTypeCallable<Name, Schema>}
     */
    const componentTypeCallable = componentType;

    Object.assign(componentTypeCallable, componentTypeObject);
    Object.defineProperty(componentTypeCallable, "name", { value: name });

    return (
      /** @type {ComponentType<Name, Schema extends ComponentSchema ? Schema : undefined>} */
      (componentTypeCallable)
    );
  }
}
