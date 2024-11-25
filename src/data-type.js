/** @import { Instance } from "./utils/class.js"; */

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