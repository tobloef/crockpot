/** @typedef {Class<Relationship>} RelationshipType */
/**
 * @typedef {(
 *   | Entity
 *   | ComponentType
 *   | Component
 *   | RelationshipType
 *   | Relationship
 * )} Target
 */
/** @abstract */
export class Relationship {
    /**
     * @template {Class<Relationship>} Type
     * @this {Type}
     * @param {QueryAssociate} owner
     * @returns {QueryRelationship<Type>}
     */
    static on<Type extends Class<Relationship>>(this: Type, owner: QueryAssociate): QueryRelationship<Type>;
    /**
     * @template {Class<Relationship>} Type
     * @this {Type}
     * @param {QueryAssociate} target
     * @returns {QueryRelationship<Type>}
     */
    static to<Type extends Class<Relationship>>(this: Type, target: QueryAssociate): QueryRelationship<Type>;
    /**
     * @param {Target} target
     */
    constructor(target: Target);
    /**
     * @param {Association[]} associations
     */
    add(...associations: Association[]): void;
    #private;
}
export type RelationshipType = Class<Relationship>;
export type Target = (Entity | ComponentType | Component | RelationshipType | Relationship);
import type { Association } from "../association.js";
import type { Class } from "../utils/class.js";
import type { QueryAssociate } from "../query/index.js";
import { QueryRelationship } from "../query/index.js";
import type { Entity } from "../entity/index.js";
import type { ComponentType } from "../component/index.js";
import type { Component } from "../component/index.js";
