import { ComponentValueStore } from "./component-value-store.ts";
import { EntityWildcardQuery } from "./queries/entity-wildcard-query.ts";
import type { Component, ComponentValue, ComponentValuePair, Tag, } from "../component/index.ts";
import type { Nullable } from "../utils/nullable.ts";
import type { RelationshipValue } from "../relationship/index.ts";
import type { Relationship } from "../relationship/index.ts";

export class Entity {
  static #brand = "Entity" as const;

  name?: string;
  __id: number;

  __components = new ComponentValueStore();


  constructor(name?: string) {
    this.name = name;
    this.__id = Math.random();
  }


  static as(name: string): EntityWildcardQuery {
    return new EntityWildcardQuery().as(name);
  }


  static once(): EntityWildcardQuery {
    return new EntityWildcardQuery().once();
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


  components(): ComponentValuePair[] {
    return [...this.__components];
  }

  get<ComponentType extends Component<any>>(
    component: ComponentType,
  ): ComponentValue<ComponentType> | null;

  get<ComponentTypes extends Component<any>[]>(
    components: ComponentTypes,
  ): GetOutputArray<ComponentTypes>;

  get<ComponentTypes extends Record<string, Component<any>>>(
    components: ComponentTypes,
  ): GetOutputObject<ComponentTypes>;

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


  getAll<RelationshipType extends Relationship<any>>(
    relationship: RelationshipType,
  ): RelationshipValue<RelationshipType>[] {
    let values: RelationshipValue<RelationshipType>[] = [];

    for (const [component] of this.__components) {
      if (component.relationship === relationship) {
        values.push(this.__components.get(component) as any);
      }
    }

    return values;
  }


  has(relationship: Relationship<any>): boolean;

  has(component: Component<any>): boolean;

  has(components: ComponentOrRelationshipTmp[]): boolean;

  has(components: Record<string, ComponentOrRelationshipTmp>): boolean;

  has(input: HasInput): boolean;

  has(input: HasInput): boolean {
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


  #getSingle<Input extends Component<any>>(
    input: Input,
  ): GetOutputSingle<Input> {
    const value = this.__components.get(input as any);

    return value as GetOutputSingle<Input>;
  }


  #getArray<Input extends Component<any>[]>(
    input: Input,
  ): GetOutputArray<Input> {
    const values: GetOutputArray<Input> = [] as any;

    for (let i = 0; i < input.length; i++) {
      values[i] = this.#getSingle(input[i]);
    }

    return values;
  }


  #getObject<Input extends Record<string, Component<any>>>(
    input: Input,
  ): GetOutputObject<Input> {
    const values: GetOutputObject<Input> = {} as any;

    for (const key in input) {
      values[key] = this.#getSingle(input[key]);
    }

    return values;
  }


  #hasSingle(input: ComponentOrRelationshipTmp): boolean {
    const value = this.__components.get(input as any);

    if (value !== null) {
      return true;
    }

    for (const [component] of this.__components) {
      if (component.relationship === input) {
        return true;
      }
    }

    return false;
  }

  #hasArray(components: ComponentOrRelationshipTmp[]): boolean {
    return components.every(this.#hasSingle.bind(this));
  }


  #hasObject(components: Record<string, ComponentOrRelationshipTmp>): boolean {
    return Object.values(components).every(this.#hasSingle.bind(this));
  }
}

export type ComponentOrRelationshipTmp = Component<any> | Relationship<any>;

type GetOutput<Input extends (
  | Component<any>
  | Component<any>[]
  | Record<string, Component<any>>
  )> = (
    Input extends Component<any> ? GetOutputSingle<Input> :
    Input extends any[] ? GetOutputArray<Input> :
    Input extends Record<string, any> ? GetOutputObject<Input> :
    never
  );

type GetOutputObject<ComponentTypes extends Record<string, Component<any>>> = {
  [Key in keyof ComponentTypes]: GetOutputSingle<ComponentTypes[Key]>;
};

type GetOutputArray<ComponentTypes extends Component<any>[]> = {
  [Index in keyof ComponentTypes]: GetOutputSingle<ComponentTypes[Index]>;
};

type GetOutputSingle<Input extends Component<any>> = (
    Input extends Component<any>
      ? Nullable<ComponentValue<Input>> :
      never
  );

type GetInput = (
  | Component<any>
  | Component<any>[]
  | Record<string, Component<any>>
  );

type HasInput = (
  | ComponentOrRelationshipTmp
  | ComponentOrRelationshipTmp[]
  | Record<string, ComponentOrRelationshipTmp>
  );
