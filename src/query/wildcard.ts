export class Wildcard {
  #brand = "wildcard";

  #name?: string;

  get name(): string | undefined {
    return this.#name;
  }


  as(name: string): this {
    this.#name = name;
    return this;
  }
}

export const Any = new Wildcard();
export const All = new Wildcard();
