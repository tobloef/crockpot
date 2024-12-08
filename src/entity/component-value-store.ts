import type {
  ComponentSchema,
  Schemaless,
  Value,
  Component, ComponentValue, Tag,
} from "../component/index.ts";

export class ComponentValueStore {
  #map = new Map<
    Component<ComponentSchema | Schemaless>,
    Value<ComponentSchema | Schemaless> | null
  >();

  // @ts-ignore: Convenience overload for schemaless components
  set<Comp extends Tag>(tag: Comp): void;

  set<Comp extends Component<any>>(
    component: Comp,
    value: ComponentValue<Comp>
  ): void;

  set<Comp extends Component<any>>(
    component: Comp,
    value: ComponentValue<Comp>
  ): void {
    this.#map.set(component, value ?? null);
  }


  get<Comp extends Component<any>>(component: Comp): ComponentValue<Comp> {
    return this.#map.get(component) as ComponentValue<Comp>;
  }


  delete<Comp extends Component<any>>(
    component: Comp
  ) {
    this.#map.delete(component);
  }

  clear() {
    this.#map.clear();
  }

  [Symbol.iterator]() {
    return this.#map[Symbol.iterator]();
  }
}

