import { NotImplementedError } from "./utils/errors/not-implemented-error.js";


/** @import { Component, ComponentSchema, TagComponentType } from "./components.js"; */
/** @import { Entity } from "./entity.js"; */

export class Entities {
  /**
   * @param {Array<
   *   | Component<string, ComponentSchema>
   *   | TagComponentType<string>
   * >} components
   * @returns {Entity}
   */
  create(...components) {
    throw new NotImplementedError();
  }

  /**
   * @param {number} id
   * @param {Array<
   *   | Component<string, ComponentSchema>
   *   | TagComponentType<string>
   * >} components
   * @returns {Entity}
   */
  insert(id, ...components) {
    throw new NotImplementedError();
  }

  /**
   * @param {number} id
   * @returns {Entity | undefined}
   */
  get(id) {
    throw new NotImplementedError();
  }
}

