export class EntityTypeQuery {
  #name?: string;
  #isOnce = false;

  get name(): string | undefined {
    return this.#name;
  }

  get isOnce(): boolean {
    return this.#isOnce;
  }

  as(name: string): EntityTypeQuery {
    this.#name = name;
    return this;
  }

  once(): EntityTypeQuery {
    this.#isOnce = true;
    return this;
  }
}