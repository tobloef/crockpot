import { Entity } from "../entity/index.ts";
import { NotImplementedError } from "../utils/errors/not-implemented-error.ts";

import type {
  ComponentValuePair,
  Tag,
} from "../component/index.ts";
import type {
  QueryArrayInput,
  QueryInput,
  QueryObjectInput,
  QueryOutput,
  SpreadOrObjectQueryInput,
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


  query<Input extends QueryArrayInput>(
    ...input: Input
  ): QueryOutput<Input>;

  query<Input extends QueryObjectInput>(
    input: Input,
  ): QueryOutput<Input>;

  query<Input extends QueryInput>(
    ...input: SpreadOrObjectQueryInput<Input>
  ): QueryOutput<Input> {
    throw new NotImplementedError();
  }
}
