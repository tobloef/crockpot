import type { Component, ComponentSource } from "../component.ts";
import { EntityInstanceQuery } from "../../entity/queries/entity-instance-query.ts";

export class ComponentInstanceQuery<
  ComponentType extends Component<any>
> extends EntityInstanceQuery {

  declare entity: ComponentType;
  source?: ComponentSource;


  constructor(component: ComponentType) {
    super(component);
  }

  get component(): ComponentType {
    return this.entity;
  }

  on(source: ComponentSource): ComponentInstanceQuery<ComponentType> {
    this.source = source;
    return this;
  }
}
