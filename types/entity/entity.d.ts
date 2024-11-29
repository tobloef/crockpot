/** @import { Association } from "../association.js" */
export class Entity {
    /**
     * @param {Association[]} associations
     */
    constructor(...associations: Association[]);
    /**
     * @param {Association[]} associations
     */
    add(...associations: Association[]): void;
    #private;
}
import type { Association } from "../association.js";
