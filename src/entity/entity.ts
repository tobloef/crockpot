import { ComponentValueStore } from "./component-value-store.ts";
import { EntityQuery } from "./query.ts";
import {
  type AnyComponent,
  type AnyComponentValuesPair, Component,
  type ComponentValue,
  type ComponentValues,
  type Tag,
} from "../component/index.ts";

export class Entity {

  #name?: string;
  __components = new ComponentValueStore();


  constructor(name?: string) {
    this.#name = name;
  }


  static as(name: string) {
    return new EntityQuery().as(name);
  }


  get name(): string | undefined {
    return this.#name;
  }


  add<Components extends Array<AnyComponentValuesPair | Tag>>(
    ...components: Components
  ): this {
    for (const pairOrTag of components) {
      if (Array.isArray(pairOrTag)) {
        const [component, values] = pairOrTag;
        this.__components.set(component, values);
      } else {
        this.__components.set(pairOrTag, null);
      }
    }

    return this;
  }


  remove<Components extends AnyComponent[]>(
    ...components: Components
  ): this {
    for (const component of components) {
      this.__components.delete(component);
    }

    return this;
  }

  get<Component extends AnyComponent>(
    component: Component
  ): ComponentValue<Component> | undefined;

  get<Components extends AnyComponent[]>(
    components: Components
  ): Partial<ComponentValues<Components>>;

  get<Components extends Record<string, AnyComponent>>(
    components: Components
  ): Partial<ComponentValues<Components>>;

  get<Input extends (AnyComponent | AnyComponent[] | Record<string, AnyComponent>)>(
    input: Input
  ): (
    Input extends AnyComponent
      ? ComponentValue<Input> | undefined
      : Input extends AnyComponent[]
        ? Partial<ComponentValues<Input>>
        : Input extends Record<string, AnyComponent>
          ? Partial<ComponentValues<Input>>
          : never
  ) {
    if (Array.isArray(input)) {
      return this.#getArray(input) as any;
    } else if (input.constructor === Object) {
      return this.#getObject(input as any) as any;
    } else {
      return this.#getSingle(input as any) as any;
    }
  }


  has<Component extends AnyComponent>(
    component: Component
  ): boolean;

  has<Components extends AnyComponent[]>(
    components: Components
  ): boolean;

  has<Components extends Record<string, AnyComponent>>(
    components: Components
  ): boolean;

  has<Input extends (AnyComponent | AnyComponent[] | Record<string, AnyComponent>)>(
    input: Input
  ): boolean {
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

  #getSingle<Component extends AnyComponent>(
    component: Component
  ): ComponentValue<Component> | undefined {
    return this.__components.get(component);
  }

  #getArray<Components extends AnyComponent[]>(
    components: Components
  ): Partial<ComponentValues<Components>> {
    const values: Partial<ComponentValues<Components>> = [] as any;

    for (let i = 0; i < components.length; i++) {
      const component = components[i];
      const value = this.__components.get(component);
      values[i] = value;
    }

    return values;
  }

  #getObject<Components extends Record<string, AnyComponent>>(
    components: Components
  ): Partial<ComponentValues<Components>> {
    const values: Partial<ComponentValues<Components>> = {} as any;

    for (const key in components) {
      const component = components[key];
      const value = this.__components.get(component);
      values[key] = value as any;
    }

    return values;
  }

  #hasSingle<Component extends AnyComponent>(
    component: Component
  ): boolean {
    const value = this.__components.get(component);
    return value !== undefined;
  }

  #hasArray<Components extends AnyComponent[]>(
    components: Components
  ): boolean {
    return components.every((component) => (
      this.__components.get(component) !== undefined
    ));
  }

  #hasObject<Components extends Record<string, AnyComponent>>(
    components: Components
  ): boolean {
    return Object.values(components).every((component) => (
      this.__components.get(component) !== undefined
    ));
  }
}
