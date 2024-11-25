import { Entity } from "../entity/entity.js";
import { NotImplementedError } from "../utils/errors/not-implemented-error.js";

/** @import { QueryPart, QueryResult } from "../query/index.js"; */

export class World {
  /**
   * @param {Entity[]} entities
   */
  add(...entities) {
    throw new NotImplementedError();
  }

  /**
   * @param {Entity[]} entities
   */
  remove(...entities) {
    throw new NotImplementedError();
  }

  /**
   * @template {QueryPart[]} QueryParts
   * @param {QueryParts} queryParts
   * @returns {QueryResult<QueryParts>}
   */
  query(...queryParts) {
    throw new NotImplementedError();
  }
}