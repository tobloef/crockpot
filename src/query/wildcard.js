export class Wildcard {
  #brand = "wildcard";

  /** @type {string | undefined} */
  #name;

  /**
   * @param {string} name
   * @returns {this}
   */
  as(name) {
    this.#name = name;
    return this;
  }
}

export const Any = new Wildcard();
export const All = new Wildcard();