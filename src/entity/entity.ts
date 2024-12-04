import { ComponentValueStore } from "./component-value-store.js";
import { EntityQuery } from "./query.js";
import { NotImplementedError } from "../utils/errors/not-implemented-error.js";
import type {
  AnyComponent,
  AnyComponentValuesPair,
  ComponentSchema,
  ComponentWithValue,
  Tag,
  Values,
} from "../component/index.js";
import type {
  QueryArrayInput,
  QueryInput,
  QueryObjectInput,
  QueryOutput,
  QueryPart,
  SpreadOrObjectQueryInput,
} from "../query/index.js";
import type { AtLeastOne } from "../utils/at-least-one.js";

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


  remove<Components extends Array<AnyComponent>>(
    ...components: Components
  ): this {
    for (const component of components) {
      this.__components.delete(component);
    }

    return this;
  }


  get<Input extends QueryArrayInput<ComponentWithValue>>(
    ...input: Input
  ): Partial<QueryOutput<Input>>;

  get<Input extends QueryObjectInput<ComponentWithValue>>(
    input: Input
  ): Partial<QueryOutput<Input>>;

  get<Input extends QueryInput<ComponentWithValue>>(
    ...input: SpreadOrObjectQueryInput<Input, ComponentWithValue>
  ): Partial<QueryOutput<Input>> {
    const isObject = input.length === 1 && !(input[0].constructor.name === "Component");

    if (isObject) {
      return this.#getObject(input[0] as QueryObjectInput<ComponentWithValue>) as Partial<QueryOutput<Input>>;
    } else {
      return this.#getArray(input as QueryArrayInput<ComponentWithValue>) as Partial<QueryOutput<Input>>;
    }
  }


  has<Input extends AtLeastOne<QueryPart>>(
    ...input: Input
  ): boolean;

  has<Input extends QueryObjectInput<QueryPart>>(
    input: Input
  ): boolean;

  has<Input extends QueryInput<QueryPart>>(
    ...input: SpreadOrObjectQueryInput<Input, QueryPart>
  ): boolean {
    throw new NotImplementedError();
  }


  destroy() {
    this.__components.clear();
  }


  #getObject(
    input: QueryObjectInput<ComponentWithValue>
  ): Partial<Record<string, Values<ComponentSchema>>> {
    let result: Partial<Record<string, Values<ComponentSchema>>> = {};

    for (const [key, component] of Object.entries(input)) {
      result[key] = this.__components.get(component);
    }

    return result;
  }


  #getArray(
    array: QueryArrayInput<ComponentWithValue>
  ): Partial<Values<ComponentSchema>> {
    let result: Partial<Values<ComponentSchema>[]> = [];

    for (const component of array) {
      result.push(this.__components.get(component));
    }

    return result;
  }
}
