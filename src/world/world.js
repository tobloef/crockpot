import { Entity } from "../entity/index.js";
import { NotImplementedError } from "../utils/errors/not-implemented-error.js";

/** @import { ComponentWithValues, Tag } from "../component/index.js"; */
/** @import { QueryInput, QueryOutput, QueryArrayInput, QueryObjectInput, SpreadOrObjectQueryInput } from "../query/index.js"; */

export class World {
  /** @type {Entity[]} */
  entities = [];

  /**
   * @param {Array<ComponentWithValues | Tag>} components
   * @returns {Entity}
   */
  create(...components) {
    const entity = new Entity().add(...components);
    this.insert(entity);
    return entity;
  }

  /** @param {Entity} entity */
  insert(entity) {
    this.entities.push(entity);
  }

  /** @param {Entity} entity */
  remove(entity) {
    this.entities.filter((e) => e !== entity);
    entity.destroy();
  }

  /**
   * @template {QueryArrayInput} Input
   * @overload
   * @param {Input} input
   * @returns {QueryOutput<Input>}
   */
  /**
   * @template {QueryObjectInput} Input
   * @overload
   * @param {Input} input
   * @returns {QueryOutput<Input>}
   */
  /**
   * @template {QueryInput} Input
   * @param {SpreadOrObjectQueryInput<Input>} input
   * @returns {QueryOutput<Input>}
   */
  query(...input) {
    throw new NotImplementedError();
  }
}
