import { ComponentValueStore } from "./component-value-store.ts";
import { EntityQuery } from "./query.ts";
import type {
  Component,
  ComponentValue,
  ComponentValuePair,
  ComponentValues,
  Tag,
} from "../component/index.ts";

export class Entity {

  name?: string;

  __components = new ComponentValueStore();


  constructor(name?: string) {
    this.name = name;
  }


  static as(name: string) {
    return new EntityQuery().as(name);
  }


  add<Components extends (ComponentValuePair | Tag)[]>(
    ...components: Components
  ): this {
    for (const pairOrTag of components) {
      if (Array.isArray(pairOrTag)) {
        const [component, value] = pairOrTag;
        this.__components.set(component, value);
      } else {
        this.__components.set(pairOrTag, null);
      }
    }

    return this;
  }


  remove<Components extends Component<any>[]>(
    ...components: Components
  ): this {
    for (const component of components) {
      this.__components.delete(component);
    }

    return this;
  }


  get<Comp extends Component<any>>(
    component: Comp,
  ): ComponentValue<Comp> | undefined;

  get<Components extends Component<any>[]>(
    components: Components,
  ): Partial<ComponentValues<Components>>;

  get<Components extends Record<string, Component<any>>>(
    components: Components,
  ): Partial<ComponentValues<Components>>;

  get<Input extends GetInput>(
    input: Input,
  ): GetOutput<Input> {
    if (Array.isArray(input)) {
      return this.#getArray(input) as any;
    } else if (input.constructor === Object) {
      return this.#getObject(input as any) as any;
    } else {
      return this.#getSingle(input as any) as any;
    }
  }


  has(component: Component<any>): boolean;

  has(components: Component<any>[]): boolean;

  has(components: Record<string, Component<any>>): boolean;

  has(input: (Component<any> | Component<any>[] | Record<string, Component<any>>)): boolean {
    if (Array.isArray(input)) {
      return this.#hasArray(input);
    } else if (input.constructor === Object) {
      return this.#hasObject(input as any);
    } else {
      return this.#hasSingle(input as any);
    }
  }


  destroy() {
    this.__components.clear();
  }


  #getSingle<Comp extends Component<any>>(
    component: Comp,
  ): ComponentValue<Comp> | undefined {
    return this.__components.get(component);
  }


  #getArray<Components extends Component<any>[]>(
    components: Components,
  ): Partial<ComponentValues<Components>> {
    const values: Partial<ComponentValues<Components>> = [] as any;

    for (let i = 0; i < components.length; i++) {
      const component = components[i];
      values[i] = this.__components.get(component);
    }

    return values;
  }


  #getObject<Components extends Record<string, Component<any>>>(
    components: Components,
  ): Partial<ComponentValues<Components>> {
    const values: Partial<ComponentValues<Components>> = {} as any;

    for (const key in components) {
      const component = components[key];
      const value = this.__components.get(component);
      values[key] = value as any;
    }

    return values;
  }


  #hasSingle(component: Component<any>): boolean {
    const value = this.__components.get(component);
    return value !== undefined;
  }


  #hasArray(components: Component<any>[]): boolean {
    return components.every((component) => (
      this.__components.get(component) !== undefined
    ));
  }


  #hasObject(components: Record<string, Component<any>>): boolean {
    return Object.values(components).every((component) => (
      this.__components.get(component) !== undefined
    ));
  }
}

type GetInput = Component<any> | Component<any>[] | Record<string, Component<any>>;

type GetOutput<Input extends GetInput> = (
  Input extends Component<any>
    ? ComponentValue<Input> | undefined
    : Input extends Component<any>[]
      ? Partial<ComponentValues<Input>>
      : Input extends Record<string, Component<any>>
        ? Partial<ComponentValues<Input>>
        : never
  )
