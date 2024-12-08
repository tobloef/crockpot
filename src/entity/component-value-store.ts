import type {
  ComponentSchema,
  Schemaless,
  Values,
  Component, ComponentValue, AnyComponent, Tag,
} from "../component/index.ts";

export class ComponentValueStore {
  #map = new Map<
    Component<ComponentSchema | Schemaless>,
    Values<ComponentSchema | Schemaless> | null
  >();

  // @ts-ignore: Convenience overload for schemaless components
  set<Comp extends Tag>(tag: Comp): void;

  set<Comp extends AnyComponent>(
    component: Comp,
    value: ComponentValue<Comp>
  ): void;

  set<Comp extends AnyComponent>(
    component: Comp,
    value: ComponentValue<Comp>
  ): void {
    this.#map.set(component, value ?? null);
  }


  get<Comp extends AnyComponent>(component: Comp): ComponentValue<Comp> {
    return this.#map.get(component) as ComponentValue<Comp>;
  }


  delete<Comp extends Component<ComponentSchema | Schemaless>>(
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

