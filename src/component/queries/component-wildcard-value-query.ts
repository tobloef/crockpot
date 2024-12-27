import type { ComponentSource } from "../component.ts";

export class ComponentWildcardValueQuery {
  typeName?: string;
  isOnce: boolean = false;
  source?: ComponentSource;

  as(typeName?: string): ComponentWildcardValueQuery {
    this.typeName = typeName;
    return this;
  }


  once(): ComponentWildcardValueQuery {
    this.isOnce = true;
    return this;
  }


  on(source: ComponentSource): ComponentWildcardValueQuery {
    this.source = source;
    return this;
  }
}
