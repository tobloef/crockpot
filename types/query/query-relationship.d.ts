/** @import { RelationshipType } from "../relationship/index.js"; */
/** @import { QueryAssociate } from "./query-associate.js"; */
/**
 * @template {RelationshipType} Type
 */
export class QueryRelationship<Type extends RelationshipType> {
    /**
     * @param {Type} type
     */
    constructor(type: Type);
    /**
     * @param {QueryAssociate} owner
     * @returns {this}
     */
    on(owner: QueryAssociate): this;
    /**
     * @param {QueryAssociate} target
     * @returns {this}
     */
    to(target: QueryAssociate): this;
    #private;
}
import type { RelationshipType } from "../relationship/index.js";
import type { QueryAssociate } from "./query-associate.js";
