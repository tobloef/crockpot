import { ComponentValueStore } from "./component-value-store.ts";
import { EntityWildcardQuery } from "./queries/entity-wildcard-query.ts";
import type { Component, ComponentValue, ComponentValuePair, Tag, } from "../component/index.ts";
import type { Nullable } from "../utils/nullable.ts";
import type { RelationshipValue } from "../relationship/index.ts";
import { Relationship } from "../relationship/index.ts";

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


  get<RelationshipType extends Relationship<any>>(
    relationship: RelationshipType,
  ): RelationshipValue<RelationshipType>[];

  get<ComponentType extends Component<any>>(
    component: ComponentType,
  ): ComponentValue<ComponentType> | null;

  get<ComponentTypes extends ComponentOrRelationship[]>(
    components: ComponentTypes,
  ): GetOutputArray<ComponentTypes>;

  get<ComponentTypes extends Record<string, ComponentOrRelationship>>(
    components: ComponentTypes,
  ): GetOutputObject<ComponentTypes>;

  get<Input extends CombinedInput>(
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


  has(relationship: Relationship<any>): boolean;

  has(component: Component<any>): boolean;

  has(components: ComponentOrRelationship[]): boolean;

  has(components: Record<string, ComponentOrRelationship>): boolean;

  has(input: CombinedInput): boolean;

  has(input: CombinedInput): boolean {
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


  #getSingle<Input extends ComponentOrRelationship>(
    input: Input,
  ): GetOutputSingle<Input> {
    if (input instanceof Relationship) {
      const relationship: Relationship<any> = input;

      const values = [];

      for (const [component, value] of this.__components) {
        if (component.relationship === relationship) {
          values.push(value);
        }
      }

      return values as GetOutputSingle<Input>;
    } else {
      const component: Component<any> = input;
      return this.__components.get(component);
    }
  }


  #getArray<Input extends ComponentOrRelationship[]>(
    input: Input,
  ): GetOutputArray<Input> {
    const values: GetOutputArray<Input> = [] as any;

    for (let i = 0; i < input.length; i++) {
      values[i] = this.#getSingle(input[i]);
    }

    return values;
  }


  #getObject<Input extends Record<string, ComponentOrRelationship>>(
    input: Input,
  ): GetOutputObject<Input> {
    const values: GetOutputObject<Input> = {} as any;

    for (const key in input) {
      values[key] = this.#getSingle(input[key]);
    }

    return values;
  }


  #hasSingle(input: ComponentOrRelationship): boolean {
    if (input instanceof Relationship) {
      const relationship: Relationship<any> = input;

      for (const [component] of this.__components) {
        if (component.relationship === relationship) {
          return true;
        }
      }

      return false;
    } else {
      const component: Component<any> = input;
      return this.__components.get(component) !== null;
    }
  }


  #hasArray(components: ComponentOrRelationship[]): boolean {
    return components.every(this.#hasSingle.bind(this));
  }


  #hasObject(components: Record<string, ComponentOrRelationship>): boolean {
    return Object.values(components).every(this.#hasSingle.bind(this));
  }
}

export type ComponentOrRelationship = Component<any> | Relationship<any>;

type GetOutput<Input extends (
  | ComponentOrRelationship
  | ComponentOrRelationship[]
  | Record<string, ComponentOrRelationship>
  )> = (
  Input extends any[] ? GetOutputArray<Input> :
    Input extends Record<string, any> ? GetOutputObject<Input> :
      Input extends ComponentOrRelationship ? GetOutputSingle<Input> :
        never
  );

type GetOutputObject<ComponentTypes extends Record<string, ComponentOrRelationship>> = {
  [Key in keyof ComponentTypes]: GetOutputSingle<ComponentTypes[Key]>;
};

type GetOutputArray<ComponentTypes extends ComponentOrRelationship[]> = {
  [Index in keyof ComponentTypes]: GetOutputSingle<ComponentTypes[Index]>;
};

type GetOutputSingle<Input extends ComponentOrRelationship> = (
  Input extends Relationship<any> ? RelationshipValue<Input>[] :
    Input extends Component<any> ? Nullable<ComponentValue<Input>> :
      never
  );

type CombinedInput = (
  | ComponentOrRelationship
  | ComponentOrRelationship[]
  | Record<string, ComponentOrRelationship>
  );
