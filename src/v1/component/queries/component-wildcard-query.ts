import type { ComponentSource } from "../component.ts";
import { ComponentWildcardValueQuery } from "./component-wildcard-value-query.ts";
import { EntityWildcardQuery } from "../../entity/queries/entity-wildcard-query.ts";

export class ComponentWildcardQuery extends EntityWildcardQuery {
  source?: ComponentSource;


  override as(name?: string): ComponentWildcardQuery {
    super.as(name);
    return this;
  }


  override once(): ComponentWildcardQuery {
    super.once();
    return this;
  }


  on(source: ComponentSource): ComponentWildcardQuery {
    this.source = source;
    return this;
  }

  value(): ComponentWildcardValueQuery {
    const valueQuery = new ComponentWildcardValueQuery();

    valueQuery.typeName = this.name;
    valueQuery.isOnce = this.isOnce;
    valueQuery.source = this.source;

    return valueQuery;
  }
}
