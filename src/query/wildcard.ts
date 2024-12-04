export class Wildcard {
  #brand = "wildcard";

  #name?: string;

  as(name: string): this {
    this.#name = name;
    return this;
  }
}

export const Any = new Wildcard();
export const All = new Wildcard();
