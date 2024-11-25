import { QueryComponent } from "../query/index.js";

/** @import { Class } from "../utils/class.js" */
/** @import { QueryAssociate } from "../query/index.js"; */

/** @typedef {Class<Component>} ComponentType */

/** @abstract */
export class Component {
  /**
   * @template {Class<Component>} Type
   * @this {Type}
   * @param {QueryAssociate} owner
   * @returns {QueryComponent<Type>}
   */
  static on(owner) {
    return new QueryComponent(this).on(owner);
  }
}

class Test extends Component {}
