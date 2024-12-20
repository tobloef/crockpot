import type { EntityWildcardQuery } from "./entity-wildcard-query.ts";

export class EntityTypeQuery {
  name?: string;
  isOnce = false;
  wildcardQuery?: EntityWildcardQuery;

  constructor(wildcardQuery?: EntityWildcardQuery) {
    this.wildcardQuery = wildcardQuery;
  }

  as(name: string): EntityTypeQuery {
    this.name = name;
    return this;
  }

  once(): EntityTypeQuery {
    this.isOnce = true;
    return this;
  }
}