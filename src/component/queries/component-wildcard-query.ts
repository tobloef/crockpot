import type { ComponentSource } from "../component.ts";
import { EntityWildcardQuery } from "../../entity/index.ts";
import { ComponentTypeQuery } from "./component-type-query.ts";

export class ComponentWildcardQuery extends EntityWildcardQuery {
  source?: ComponentSource;


  override as(name: string): ComponentWildcardQuery {
    super.as(name);
    return this;
  }

  override once(): ComponentWildcardQuery {
    super.once();
    return this;
  }

  override type() {
    return new ComponentTypeQuery(this);
  }

  on(source: ComponentSource): ComponentWildcardQuery {
    this.source = source;
    return this;
  }
}
