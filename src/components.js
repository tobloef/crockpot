/** @import { DataType, DataTypeToType } from "./data-type.js"; */

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
 * @typedef {Schema extends ComponentSchema ? {
 *   [Key in keyof Schema]: DataTypeToType<Schema[Key]>
 * } : never} Component
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
 * @template {string} Name
 * @template {ComponentSchema | undefined} [Schema=undefined]
 * @typedef {Object} ComponentTypeObject
 * @property {Name} name
 * @property {Schema} [schema]
 */

/**
 * @template {string} Name
 * @template {ComponentSchema | undefined} [Schema=undefined]
 * @typedef {(
 *   & ((values: Component<Name, Schema>) => Component<Name, Schema>)
 * )} ComponentTypeCallable
 */

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
