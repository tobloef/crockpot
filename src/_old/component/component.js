import { QueryComponent } from "../query/index.js";

/** @import { Class } from "../utils/class.js" */
/** @import { QueryAssociate } from "../query/index.js"; */
/** @import { Association } from "../association.js" */

/** @typedef {Class<Component>} ComponentType */

/** @abstract */
export class Component {
  #brand = Component.name;

  /**
   * @template {Class<Component>} Type
   * @this {Type}
   * @param {QueryAssociate} owner
   * @returns {QueryComponent<Type>}
   */
  static on(owner) {
    return new QueryComponent(this).on(owner);
  }

  /**
   * @param {Association[]} associations
   */
  add(...associations) {

  }
}

class Test extends Component {}
