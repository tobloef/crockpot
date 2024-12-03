/** @import { Class, Instance } from "../utils/class.js"; */
/** @import { Component } from "./component.js"; */

/** @typedef {Record<string, Class<any>>} ComponentSchema */

/** @typedef {undefined} Schemaless */

/**
 * @template {ComponentSchema | Schemaless} Schema
 * @typedef {(
 *   Schema extends ComponentSchema
 *     ? { [K in keyof Schema]: Instance<Schema[K]> }
 *     : never
 * )} Values
 */

/**
 * @template {ComponentSchema | Schemaless} Schema
 * @typedef {(
 *   Schema extends ComponentSchema
 *     ? [Schema]
 *     : []
 * )} SchemaIfNotSchemaless
 */

/**
 * @template {Component<Schema>} Comp
 * @template {ComponentSchema | Schemaless} Schema
 * @typedef {[
 *   component: Comp,
 *   values: Values<Schema>,
 * ]} ComponentValuesPair
 */

export {};