/** @import { Class, Instance } from "./utils/class.js"; */

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

export {};