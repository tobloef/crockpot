import type { ComponentSource } from "../component.ts";
import { EntityWildcardQuery } from "../../entity/index.ts";

export class ComponentWildcardQuery {
  isOnce: boolean = false;
  source?: ComponentSource;


  once(): ComponentWildcardQuery {
    this.isOnce = true;
    return this;
  }


  on(source: ComponentSource): ComponentWildcardQuery {
    this.source = source;
    return this;
  }
}
