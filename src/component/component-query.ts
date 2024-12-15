import type { Component, ComponentSource } from "./component.ts";
import type { Class } from "../utils/class.ts";
import { EntityQuery } from "../entity/entity-query.ts";

export class ComponentQuery<
  ComponentType extends Component<any> | Class<Component<any>>,
> extends EntityQuery {
  #component: ComponentType;
  #source?: ComponentSource;


  constructor(component: ComponentType) {
    super();
    this.#component = component;
  }


  get component(): ComponentType {
    return this.#component;
  }


  get source(): ComponentSource | undefined {
    return this.#source;
  }


  override as(name: string): ComponentQuery<ComponentType> {
    super.as(name);
    return this;
  }

  override once(): ComponentQuery<ComponentType> {
    super.once();
    return this;
  }

  on(source: ComponentSource): ComponentQuery<ComponentType> {
    this.#source = source;
    return this;
  }
}
