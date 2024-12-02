import { NotImplementedError } from "./utils/errors/not-implemented-error.js";

export class Entity {
  /**
   * @template {ComponentAndValuesOrTag[]} Components
   * @param {Components} components
   * @returns {this}
   */
  add(...components) {
    throw new NotImplementedError();
  }

  /**
   * @template {Component<any>[]} Components
   * @param {Components} components
   * @returns {this}
   */
  remove(...components) {
    throw new NotImplementedError();
  }

  /**
   * @param {GetInput} input
   * @returns {GetOutput<GetInput>}
   */
  get(...input) {}

  /**
   * @param {string} name
   * @returns EntityQuery<typeof this>
   */
  as(name) {}

  destroy() {}
}