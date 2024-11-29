/** @import { QueryPart, QueryResult } from "../query/index.js"; */
export class World {
    /**
     * @param {Entity[]} entities
     */
    add(...entities: Entity[]): void;
    /**
     * @param {Entity[]} entities
     */
    remove(...entities: Entity[]): void;
    /**
     * @template {QueryPart[]} QueryParts
     * @param {QueryParts} queryParts
     * @returns {QueryResult<QueryParts>}
     */
    query<QueryParts extends QueryPart[]>(...queryParts: QueryParts): QueryResult<QueryParts>;
    #private;
}
import { Entity } from "../entity/entity.js";
import type { QueryPart } from "../query/index.js";
import type { QueryResult } from "../query/index.js";
