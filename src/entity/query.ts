export class EntityQuery {
  #name?: string;
  #isOnce: boolean = false;

  get name(): string | undefined {
    return this.#name;
  }

  get isOnce(): boolean {
    return this.#isOnce;
  }

  as(name?: string): EntityQuery {
    this.#name = name;
    return this;
  }

  once(): EntityQuery {
    this.#isOnce = true;
    return this;
  }
}
