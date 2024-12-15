import type { ComponentSource } from "./index.ts";
import { EntityTypeQuery } from "../entity/entity-type-query.ts";

export class ComponentTypeQuery extends EntityTypeQuery {
  #source?: ComponentSource;

  get source(): ComponentSource | undefined {
    return this.#source;
  }

  as(name: string): ComponentTypeQuery {
    super.as(name);
    return this;
  }

  once(): ComponentTypeQuery {
    super.once();
    return this;
  }

  on(source: ComponentSource): ComponentTypeQuery {
    this.#source = source;
    return this;
  }
}