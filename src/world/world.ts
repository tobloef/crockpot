import { Entity } from "../entity/index.ts";
import { NotImplementedError } from "../utils/errors/not-implemented-error.ts";

import type {
  ComponentValuePair,
  Tag,
} from "../component/index.ts";
import type {
  QueryInput,
  QueryOutput,
  QueryArrayInput,
  QueryObjectInput,
  SpreadOrObjectQueryInput,
  QueryPart,
} from "../query/index.ts";

export class World {
  #entities: Entity[] = [];


  create(...components: Array<ComponentValuePair | Tag>): Entity {
    const entity = new Entity().add(...components);
    this.insert(entity);
    return entity;
  }


  insert(entity: Entity) {
    this.#entities.push(entity);
  }


  remove(entity: Entity) {
    this.#entities.filter((e) => e !== entity);
    entity.destroy();
  }


  query<Input extends QueryArrayInput<QueryPart>>(
    ...input: Input
  ): QueryOutput<Input>;

  query<Input extends QueryObjectInput<QueryPart>>(
    input: Input
  ): QueryOutput<Input>;

  query<Input extends QueryInput<QueryPart>>(
    ...input: SpreadOrObjectQueryInput<Input, QueryPart>
  ): QueryOutput<Input> {
    throw new NotImplementedError();
  }
}
