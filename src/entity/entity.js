import { NotImplementedError } from "../utils/errors/not-implemented-error.js";
import { EntityQuery } from "./query.js";

/** @import { AnyComponent, ComponentWithValues, Tag } from "../component/index.js"; */
/** @import { QueryInput, QueryOutput, QueryArrayInput, QueryObjectInput, SpreadOrObjectQueryInput } from "../query/index.js"; */

export class Entity {
  /** @type {string | undefined} */
  name;

  /** @param {string} [name] */
  constructor(name) {
    this.name = name;
  }

  /**
   * @param {string} name
   * @returns {EntityQuery}
   */
  static as(name) {
    return new EntityQuery().as(name);
  }

  /**
   * @template {Array<ComponentWithValues | Tag>} Components
   * @param {Components} components
   * @returns {this}
   */
  add(...components) {
    throw new NotImplementedError();
  }

  /**
   * @template {Array<AnyComponent>} Components
   * @param {Components} components
   * @returns {this}
   */
  remove(...components) {
    throw new NotImplementedError();
  }

  /**
   * @template {QueryArrayInput} Input
   * @overload
   * @param {Input} input
   * @returns {Partial<QueryOutput<Input>>}
   */
  /**
   * @template {QueryObjectInput} Input
   * @overload
   * @param {Input} input
   * @returns {Partial<QueryOutput<Input>>}
   */
  /**
   * @template {QueryInput} Input
   * @param {SpreadOrObjectQueryInput<Input>} input
   * @returns {Partial<QueryOutput<Input>>}
   */
  get(...input) {
    throw new NotImplementedError();
  }

  /**
   * @template {QueryArrayInput} Input
   * @overload
   * @param {Input} input
   * @returns {boolean}
   */
  /**
   * @template {QueryObjectInput} Input
   * @overload
   * @param {Input} input
   * @returns {boolean}
   */
  /**
   * @template {QueryInput} Input
   * @param {SpreadOrObjectQueryInput<Input>} input
   * @returns {boolean}
   */
  has(...input) {
    throw new NotImplementedError();
  }

  destroy() {
    throw new NotImplementedError();
  }
}
