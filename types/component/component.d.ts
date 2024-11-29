/** @import { Class } from "../utils/class.js" */
/** @import { QueryAssociate } from "../query/index.js"; */
/** @import { Association } from "../association.js" */
/** @typedef {Class<Component>} ComponentType */
/** @abstract */
export class Component {
    /**
     * @template {Class<Component>} Type
     * @this {Type}
     * @param {QueryAssociate} owner
     * @returns {QueryComponent<Type>}
     */
    static on<Type extends Class<Component>>(this: Type, owner: QueryAssociate): QueryComponent<Type>;
    /**
     * @param {Association[]} associations
     */
    add(...associations: Association[]): void;
    #private;
}
export type ComponentType = Class<Component>;
import type { Association } from "../association.js";
import type { Class } from "../utils/class.js";
import type { QueryAssociate } from "../query/index.js";
import { QueryComponent } from "../query/index.js";
