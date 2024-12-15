import type { ComponentSource } from "./component.ts";
import { EntityWildcardQuery } from "../entity/index.ts";
import { ComponentTypeQuery } from "./component-type-query.ts";

export class ComponentWildcardQuery extends EntityWildcardQuery {
  #source?: ComponentSource;


  get source(): ComponentSource | undefined {
    return this.#source;
  }


  override as(name: string): ComponentWildcardQuery {
    super.as(name);
    return this;
  }

  override once(): ComponentWildcardQuery {
    super.once();
    return this;
  }


  on(source: ComponentSource): ComponentWildcardQuery {
    this.#source = source;
    return this;
  }

  override type() {
    const typeQuery = new ComponentTypeQuery();

    if (this.source !== undefined) {
      typeQuery.on(this.source);
    }

    if (this.name !== undefined) {
      typeQuery.as(this.name);
    }

    if (this.isOnce) {
      typeQuery.once();
    }

    return typeQuery;
  }
}
