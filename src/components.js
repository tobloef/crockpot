/** @import { DataType, DataTypeToType } from "./data-type.js"; */
/** @import { Entity } from "./entity.js"; */

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
 * @typedef {Schema extends ComponentSchema ? ({
 *   [Key in keyof Schema]: DataTypeToType<Schema[Key]>
 * } & {__type: "component"}) : never} Component
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
 * @typedef {{ __source: "ref" }} RefSourceCall
 */

/**
 * @template {Component<string, any>} T
 * @typedef {{ __source: "component" }} ComponentSourceCall
 */

/**
 * @template {Component<string, any>} T
 * @typedef {{ __source: "componentType" }} ComponentTypeSourceCall
 */

/**
 * @template {Component<string, any>} T
 * @typedef {{ __source: "entity" }} EntitySourceCall
 */

/**
 * @template {Component<string, any>} T
 * @typedef {{ __source: "wildcard" }} WildcardSourceCall
 */

/**
 * @template {string} Name
 * @template {ComponentSchema | undefined} [Schema=undefined]
 * @typedef {Object} ComponentTypeObject
 * @property {Name} name
 * @property {Schema} [schema]
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
 *   & ((source: Wildcard) => WildcardSourceCall<Component<Name, Schema>>)
 * )} ComponentTypeCallable
 */

export const Wildcard = ({ __type: "wildcard" });

export class Components {
  /**
   * @template {string} Name
   * @template {ComponentSchema | undefined} [Schema=undefined]
   * @param {Name} name
   * @param {Schema} [schema]
   * @returns {ComponentType<Name, Schema extends ComponentSchema ? Schema : undefined>}
   */
  define(name, schema) {
    /** @type {Omit<ComponentTypeObject<Name, Schema>, "name">} */
    const componentTypeObject = {
      schema,
    };

    /**
     * @param {Component<Name, Schema>} [arg1]
     * @returns {Component<Name, Schema> | void}
     */
    function componentTypeCallable(arg1) {
      return arg1;
    }

    Object.assign(componentTypeCallable, componentTypeObject);
    Object.defineProperty(componentTypeCallable, "name", { value: name });

    return (
      /** @type {ComponentType<Name, Schema extends ComponentSchema ? Schema : undefined>} */
      (componentTypeCallable)
    );
  }
}
