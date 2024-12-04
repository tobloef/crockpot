import { NotImplementedError } from "../utils/errors/not-implemented-error.js";
import { EntityQuery } from "./query.js";
import type {
  AnyComponent,
  AnyComponentValuesPair,
  Tag,
} from "../component/index.js";
import type {
  QueryArrayInput,
  QueryInput,
  QueryObjectInput,
  QueryOutput,
  QueryPart,
  SpreadOrObjectQueryInput,
  ValuedQueryPart,
} from "../query/index.js";
import { ComponentValueStore } from "../component/component-value-store.js";
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


  get<Input extends ValuedQueryPart>(
    input: Input
  ): QueryOutput<Input> | undefined;

  get<Input extends QueryArrayInput<ValuedQueryPart>>(
    ...input: Input
  ): Partial<QueryOutput<Input>>;

  get<Input extends QueryObjectInput<ValuedQueryPart>>(
    input: Input
  ): Partial<QueryOutput<Input>>;

  get<Input extends QueryInput<ValuedQueryPart>>(
    ...input: SpreadOrObjectQueryInput<Input, ValuedQueryPart>
  ): Partial<QueryOutput<Input>> {
    throw new NotImplementedError();
  }


  has<Input extends QueryPart>(
    input: Input
  ): boolean;

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
}
