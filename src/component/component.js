import { Entity } from "../entity/entity.js";
import { ComponentQuery } from "./query.js";

/** @import { ComponentSchema, Schemaless, SchemaIfNotSchemaless, Values, ComponentValuesPair } from "./schema.js"; */

/** @typedef {Component<ComponentSchema | Schemaless>} AnyComponent */

/** @typedef {Component<Schemaless>} Tag */

/** @typedef {Component<ComponentSchema>} ComponentWithValues */

/** @template {ComponentSchema | Schemaless} [Schema=Schemaless] */
export class Component extends Entity {
  /** @type {Schema | Schemaless} */
  schema;

  /**
   * @overload
   * @param {Schema} [schema]
   */
  /**
   * @overload
   * @param {string} [name]
   * @param {Schema} [schema]
   */
  /**
   * @param {string | Schema} [nameOrSchema]
   * @param {Schema} [schemaOrUndefined]
   */
  constructor(nameOrSchema, schemaOrUndefined) {
    const name = typeof nameOrSchema === "string" ? nameOrSchema : undefined;
    const schema = typeof nameOrSchema === "string" ? schemaOrUndefined : nameOrSchema;

    super(name);
    this.schema = schema;
  }

  /**
   * @param {Entity | string} source
   * @returns {ComponentQuery<typeof this>}
   */
  on(source) {
    return new ComponentQuery(this).on(source);
  }

  /**
   * @param {string} name
   * @returns {ComponentQuery<typeof this>}
   */
  as(name) {
    return new ComponentQuery(this).as(name);
  }

  /**
   * @param {Values<Schema>} values
   * @return {ComponentValuesPair<typeof this, Schema>}
   */
  with(values) {
    return [this, values];
  }
}
