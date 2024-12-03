export class EntityQuery {
  /** @type {string | undefined} */
  #name;

  /**
   * @param {string} name
   * @returns {EntityQuery}
   */
  as(name) {
    this.#name = name;
    return this;
  }
}