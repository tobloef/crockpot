import { NotImplementedError } from "./utils/errors/not-implemented-error.js";

/** @import { World } from "./world.js"; */
/** @import { Component, ComponentSchema, TagComponentType, ComponentType, ComponentTypesToComponents, ComponentTypeObject } from "./components.js"; */

export class Entity {
  /** @type {number} */
  #id;

  /** @type {World} */
  #world;

  get id() {
    return this.#id;
  }

  get world() {
    return this.#world;
  }

  /**
   * @param {number} id
   * @param {World} world
   */
  constructor(id, world) {
    this.#id = id;
    this.#world = world;
  }

  /**
   * @param {Array<
   *   | Component<string, ComponentSchema>
   *   | TagComponentType<string>
   * >} components
   */
  add(...components) {
    throw new NotImplementedError();
  }

  /**
   * @param {Array<
   *   | Component<string, ComponentSchema>
   *   | TagComponentType<string>
   * >} components
   */
  remove(...components) {
    throw new NotImplementedError();
  }

  destroy() {
    throw new NotImplementedError();
  }

  /**
   * @template {ComponentTypeObject<string, ComponentSchema>[]} ComponentTypes
   * @param {ComponentTypes} components
   * @returns {ComponentTypesToComponents<ComponentTypes>}
   */
  get(...components) {
    throw new NotImplementedError();
  }
}