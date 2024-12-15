import type { ComponentSource } from "../index.ts";
import { EntityTypeQuery } from "../../entity/queries/entity-type-query.ts";

export class ComponentTypeQuery extends EntityTypeQuery {
  source?: ComponentSource;

  override as(name: string): ComponentTypeQuery {
    super.as(name);
    return this;
  }

  override once(): ComponentTypeQuery {
    super.once();
    return this;
  }

  on(source: ComponentSource): ComponentTypeQuery {
    this.source = source;
    return this;
  }
}