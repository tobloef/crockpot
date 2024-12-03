/** @import { AnyComponent } from "./component.js"; */
/** @import { Entity } from "../entity/entity.js"; */

/** @template {AnyComponent} Comp */
export class ComponentQuery {
  /** @type {Comp} */
  #component;

  /** @type {Entity | string | undefined} */
  #source;

  /** @type {string | undefined} */
  #name;

  /** @param {Comp} component */
  constructor(component) {
    this.#component = component;
  }

  /**
   * @param {Entity | string} source
   * @returns {ComponentQuery<Comp>}
   */
  on(source) {
    this.#source = source;
    return this;
  }

  /**
   * @param {string} name
   * @returns {ComponentQuery<Comp>}
   */
  as(name) {
    this.#name = name;
    return this;
  }
}
