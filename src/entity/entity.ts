import { ComponentValueStore } from "./component-value-store.ts";
import { EntityWildcardQuery } from "./queries/entity-wildcard-query.ts";
import { EntityTypeQuery } from "./queries/entity-type-query.ts";
import type { Component, ComponentValue, ComponentValuePair, ComponentValues, Tag, } from "../component/index.ts";
import type { Nullable } from "../utils/nullable.ts";
import type { Relationship, RelationshipValue } from "../relationship/index.ts";

export class Entity {
  static #brand = "Entity" as const;

  name?: string;

  __components = new ComponentValueStore();


  constructor(name?: string) {
    this.name = name;
  }


  static as(name: string): EntityWildcardQuery {
    return new EntityWildcardQuery().as(name);
  }


  static once(): EntityWildcardQuery {
    return new EntityWildcardQuery().once();
  }

  static type() {
    return new EntityTypeQuery()
  }


  add<Components extends (ComponentValuePair | Tag)[]>(
    ...components: Components
  ): this {
    for (const pairOrTag of components) {
      if (Array.isArray(pairOrTag)) {
        const [component, value] = pairOrTag;
        this.__components.set(component, value);
      } else {
        const tag = pairOrTag;
        this.__components.set(tag);
      }
    }

    return this;
  }


  remove<ComponentTypes extends Component<any>[]>(
    ...components: ComponentTypes
  ): this {
    for (const component of components) {
      this.__components.delete(component);
    }

    return this;
  }


  get<RelationshipType extends Relationship<any>>(
    relationship: RelationshipType,
  ): RelationshipValue<RelationshipType>[];

  get<ComponentType extends Component<any>>(
    component: ComponentType,
  ): ComponentValue<ComponentType> | undefined;

  get<ComponentTypes extends Component<any>[]>(
    components: ComponentTypes,
  ): Nullable<ComponentValues<ComponentTypes>>;

  get<ComponentTypes extends Record<string, Component<any>>>(
    components: ComponentTypes,
  ): Nullable<ComponentValues<ComponentTypes>>;

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


  #getSingle<ComponentType extends Component<any>>(
    component: ComponentType,
  ): ComponentValue<ComponentType> | null {
    return this.__components.get(component);
  }


  #getArray<ComponentTypes extends Component<any>[]>(
    components: ComponentTypes,
  ): Nullable<ComponentValues<ComponentTypes>> {
    const values: Nullable<ComponentValues<ComponentTypes>> = [] as any;

    for (let i = 0; i < components.length; i++) {
      const component = components[i];
      values[i] = this.__components.get(component);
    }

    return values;
  }


  #getObject<ComponentTypes extends Record<string, Component<any>>>(
    components: ComponentTypes,
  ): Nullable<ComponentValues<ComponentTypes>> {
    const values: Nullable<ComponentValues<ComponentTypes>> = {} as any;

    for (const key in components) {
      const component = components[key];
      const value = this.__components.get(component);
      values[key] = value as any;
    }

    return values;
  }


  #hasSingle(component: Component<any>): boolean {
    const value = this.__components.get(component);
    return value !== null;
  }


  #hasArray(components: Component<any>[]): boolean {
    return components.every((component) => (
      this.__components.get(component) !== null
    ));
  }


  #hasObject(components: Record<string, Component<any>>): boolean {
    return Object.values(components).every((component) => (
      this.__components.get(component) !== null
    ));
  }
}

type GetInput = Component<any> | Relationship<any>;

type GetOutput<Input extends GetInput> = (
  Input extends Relationship<any> ? RelationshipValue<Input>[] :
  Input extends Component<any> ? Nullable<ComponentValue<Input>> :
  never
);


