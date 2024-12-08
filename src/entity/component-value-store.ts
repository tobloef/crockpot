import type {
  Component,
  Schema,
  ComponentValue,
  Schemaless,
  Tag,
  Value,
} from "../component/index.ts";

export class ComponentValueStore {
  #map = new Map<
    Component<Schema | Schemaless>,
    Value<Schema | Schemaless> | null
  >();


  // @ts-ignore: Convenience overload for schemaless components
  set<Comp extends Tag>(tag: Comp): void;

  set<Comp extends Component<any>>(
    component: Comp,
    value: ComponentValue<Comp>,
  ): void;

  set<Comp extends Component<any>>(
    component: Comp,
    value: ComponentValue<Comp>,
  ): void {
    this.#map.set(component, value ?? null);
  }


  get<Comp extends Component<any>>(component: Comp): ComponentValue<Comp> {
    return this.#map.get(component) as ComponentValue<Comp>;
  }


  delete<Comp extends Component<any>>(
    component: Comp,
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

