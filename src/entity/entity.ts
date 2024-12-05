import { ComponentValueStore } from "./component-value-store.ts";
import { EntityQuery } from "./query.ts";
import { NotImplementedError } from "../utils/errors/not-implemented-error.ts";
import type {
  AnyComponent,
  AnyComponentValuesPair,
  ComponentSchema,
  ComponentWithValue,
  Tag,
  Values,
} from "../component/index.ts";
import type {
  QueryArrayInput,
  QueryInput,
  QueryObjectInput,
  QueryOutput,
  QueryPart,
  SpreadOrObjectQueryInput,
} from "../query/index.ts";
import type { AtLeastOne } from "../utils/at-least-one.ts";
import { query } from "../query/query.ts";

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
    const isObject = input.length === 1 && !(input[0].constructor.name === "Component"); // TODO: Better check

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
    let results: QueryOutput<Input>[];

    if (input.length === 1) { // TODO: Better check, won't work at all
      results = query([this], input[0] as QueryObjectInput<QueryPart>) as QueryOutput<Input>[];
    } else {
      results = query([this], input as QueryArrayInput<QueryPart>) as QueryOutput<Input>[];
    }

    return results.length > 0;
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
