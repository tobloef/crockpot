import type {
  ComponentSchema,
  Schemaless,
  Values,
} from "./schema.js";
import type { Component } from "./component.js";

export class ComponentValueStore {
  #map = new Map<
    Component<ComponentSchema | Schemaless>,
    Values<ComponentSchema | Schemaless> | null
  >();


  set<
    Comp extends Component<Schemaless>,
    Schema extends Schemaless
  >(component: Comp, value: null): void;

  set<
    Comp extends Component<ComponentSchema>,
    Schema extends ComponentSchema
  >(component: Comp, value: Values<Schema>): void;

  set<
    Comp extends Component<Schema>,
    Schema extends ComponentSchema | Schemaless
  >(component: Comp, value: Values<Schema> | null) {
    this.#map.set(component, value);
  }


  get<
    Comp extends Component<Schemaless>,
    Schema extends Schemaless
  >(component: Comp): null | undefined;

  get<
    Comp extends Component<ComponentSchema>,
    Schema extends ComponentSchema
  >(component: Comp): Values<Schema> | undefined;

  get<
    Comp extends Component<Schema>,
    Schema extends ComponentSchema | Schemaless
  >(component: Comp): Values<Schema> | null | undefined {
    return this.#map.get(component) as Values<Schema> | null | undefined;
  }

  delete<Comp extends Component<ComponentSchema | Schemaless>>(
    component: Comp
  ) {
    this.#map.delete(component);
  }
}
