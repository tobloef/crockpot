/** @import { ComponentType } from "../component/index.js"; */
/** @import { QueryAssociate } from "./query-associate.js"; */
/**
 * @template {ComponentType} Type
 */
export class QueryComponent<Type extends ComponentType> {
    /**
     * @param {Type} componentType
     */
    constructor(componentType: Type);
    /**
     * @param {QueryAssociate} owner
     * @returns {this}
     */
    on(owner: QueryAssociate): this;
    #private;
}
import type { ComponentType } from "../component/index.js";
import type { QueryAssociate } from "./query-associate.js";
