import { Entities } from "./entities.js";
import { Components } from "./components.js";
import { Relations } from "./relations.js";

/** @import {
 *   ComponentSchema,
 *   ComponentType,
 *   Component,
 *   TagComponentType,
 * } from "./components.js"; */
/** @import { Entity } from "./entity.js"; */


export class World {
  #entities = new Entities();
  #components = new Components();
  #relations = new Relations();

  get entities() {
    return this.#entities;
  }

  get components() {
    return this.#components;
  }

  get relations() {
    return this.#relations;
  }

  /**
   * Alias for `World.components.define(...)`.
   *
   * @template {string} Name
   * @template {ComponentSchema | undefined} [Schema=undefined]
   * @param {Name} name
   * @param {Schema} [schema]
   * @returns {ComponentType<Name, Schema extends ComponentSchema ? Schema : undefined>}
   */
  define(name, schema) {
    return this.#components.define(name, schema);
  }

  /**
   * Alias for `World.entities.create(...)`.
   *
   * @param {Array<
   *   | Component<string, ComponentSchema>
   *   | TagComponentType<string>
   * >} components
   * @returns {Entity}
   */
  create(...components) {
    return this.#entities.create(...components);
  }

  /**
   * Alias for `World.entities.insert(...)`.
   *
   * @param {number} id
   * @param {Array<
   *   | Component<string, ComponentSchema>
   *   | TagComponentType<string>
   * >} components
   * @returns {Entity}
   */
  insert(id, ...components) {
    return this.#entities.insert(id, ...components);
  }

  /**
   * Alias for `World.entities.get(...)`.
   *
   * @param {number} id
   * @returns {Entity | undefined}
   */
  get(id) {
    return this.#entities.get(id);
  }
}