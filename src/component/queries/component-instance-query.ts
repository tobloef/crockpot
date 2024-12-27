import type {
  Component,
  ComponentSource,
} from "../component.ts";

export class ComponentInstanceQuery<
  ComponentType extends Component<any>
> {
  component: ComponentType;
  isOnce: boolean = false;
  source?: ComponentSource;


  constructor(component: ComponentType) {
    this.component = component;
  }


  once(): ComponentInstanceQuery<ComponentType> {
    this.isOnce = true;
    return this;
  }


  on(source: ComponentSource): ComponentInstanceQuery<ComponentType> {
    this.source = source;
    return this;
  }
}
