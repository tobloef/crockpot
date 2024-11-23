/** @import { Instance } from "./utils/class.js"; */

/**
 * @template T
 * @typedef {Object} DataTypeDefinition
 * @property {T} type
 */

const DataTypes = {
  "number": {
    type: Number,
  },
  "string": {
    type: String,
  },
}

/**
 * @template {keyof typeof DataTypes} Key
 * @typedef {Instance<typeof DataTypes[Key]["type"]>} DataTypeToType
 */

/**
 * @typedef {keyof typeof DataTypes} DataType
 */

export {};