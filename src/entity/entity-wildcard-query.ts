import { EntityTypeQuery } from "./entity-type-query.ts";

export class EntityWildcardQuery {
  #name?: string;
  #isOnce: boolean = false;

  get name(): string | undefined {
    return this.#name;
  }

  get isOnce(): boolean {
    return this.#isOnce;
  }

  as(name?: string): EntityWildcardQuery {
    this.#name = name;
    return this;
  }

  once(): EntityWildcardQuery {
    this.#isOnce = true;
    return this;
  }

  type() {
    const typeQuery = new EntityTypeQuery();

    if (this.name !== undefined) {
      typeQuery.as(this.name);
    }

    if (this.isOnce) {
      typeQuery.once();
    }

    return typeQuery;
  }
}
