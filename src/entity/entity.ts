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
  SpreadOrObjectQueryInput,
} from "../query/index.js";
import { ComponentValueStore } from "../component/component-value-store.js";

export class Entity {

  name?: string;
  components = new ComponentValueStore();


  constructor(name?: string) {
    this.name = name;
  }


  static as(name: string) {
    return new EntityQuery().as(name);
  }


  add<Components extends Array<AnyComponentValuesPair | Tag>>(
    ...components: Components
  ): this {
    for (const pairOrTag of components) {
      if (Array.isArray(pairOrTag)) {
        const [component, values] = pairOrTag;
        this.components.set(component, values);
      } else {
        this.components.set(pairOrTag, null);
      }
    }

    return this;
  }


  remove<Components extends Array<AnyComponent>>(
    ...components: Components
  ): this {
    for (const component of components) {
      this.components.delete(component);
    }

    return this;
  }


  get<Input extends QueryArrayInput>(
    ...input: SpreadOrObjectQueryInput<Input>
  ): Partial<QueryOutput<Input>>;

  get<Input extends QueryObjectInput>(
    ...input: SpreadOrObjectQueryInput<Input>
  ): Partial<QueryOutput<Input>>;

  get<Input extends QueryInput>(
    ...input: SpreadOrObjectQueryInput<Input>
  ): Partial<QueryOutput<Input>> {
    throw new NotImplementedError();
  }


  has<Input extends QueryArrayInput>(
    ...input: SpreadOrObjectQueryInput<Input>
  ): boolean;

  has<Input extends QueryObjectInput>(
    ...input: SpreadOrObjectQueryInput<Input>
  ): boolean;

  has<Input extends QueryInput>(
    ...input: SpreadOrObjectQueryInput<Input>
  ): boolean {
    throw new NotImplementedError();
  }


  destroy() {
    throw new NotImplementedError();
  }
}
