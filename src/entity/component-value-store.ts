import type {
  Component,
  ComponentValue,
  Tag,
} from "../component/index.ts";

export class ComponentValueStore {
  // Stores null for components that have no value, so we can differentiate between
  // tags (components with no value) and components that don't exist.
  #map = new Map<
    Component<any>,
    any | null
  >();


  set<ComponentType extends Tag>(tag: ComponentType): void;

  set<ComponentType extends Component<any>>(
    component: ComponentType,
    value: ComponentValue<ComponentType>,
  ): void;

  set<ComponentType extends Component<any>>(
    component: ComponentType,
    value?: ComponentValue<ComponentType>,
  ): void {
    this.#map.set(component, value ?? null);
  }


  get<Input extends Component<any>>(
    input: Input,
  ): ComponentValue<Input> | null {
    const value = this.#map.get(input);

    if (value === undefined) {
      return null;
    }

    if (value === null) {
      return undefined as ComponentValue<Input>;
    }

    return value;
  }


  delete<ComponentType extends Component<any>>(
    component: ComponentType,
  ) {
    this.#map.delete(component);
  }


  clear() {
    this.#map.clear();
  }


  [Symbol.iterator]() {
    const entries = this.#map.entries();

    return {
      next: () => {
        const { done, value } = entries.next();
        if (done) {
          return { done, value };
        }
        const [component, componentValue] = value;

        return {
          done: false,
          value: [
            component,
            componentValue === null ? undefined : componentValue,
          ],
        };
      },
    };
  }
}

