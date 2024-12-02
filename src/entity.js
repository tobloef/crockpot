import { NotImplementedError } from "./utils/errors/not-implemented-error.js";

export class Entity {
  /**
   * @template {Array<ComponentWithValues | Tag>} Components
   * @param {Components} components
   * @returns {this}
   */
  add(...components) {
    throw new NotImplementedError();
  }

  /**
   * @template {Array<Component<any>>} Components
   * @param {Components} components
   * @returns {this}
   */
  remove(...components) {
    throw new NotImplementedError();
  }

  /**
   * @template {QueryInput} Input
   * @param {Input} input
   * @returns {Partial<QueryOutput<Input>>}
   */
  get(...input) {
    throw new NotImplementedError();
  }

  /**
   * @template {QueryInput} Input
   * @param {Input} input
   * @returns {boolean}
   */
  has(...input) {

  }

  destroy() {
    throw new NotImplementedError();
  }
}
