import type { Component, ComponentSource, } from "../component.ts";

export class ComponentInstanceQuery<
  ComponentType extends Component<any>
> {
  component: ComponentType;
  source?: ComponentSource;


  constructor(component: ComponentType) {
    this.component = component;
  }


  on(source: ComponentSource): ComponentInstanceQuery<ComponentType> {
    this.source = source;
    return this;
  }
}
