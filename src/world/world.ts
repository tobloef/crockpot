import { Entity } from "../entity/index.js";
import { NotImplementedError } from "../utils/errors/not-implemented-error.js";

import type {
  AnyComponentValuesPair,
  Tag,
} from "../component/index.js";
import type { QueryInput, QueryOutput, QueryArrayInput, QueryObjectInput, SpreadOrObjectQueryInput } from "../query/index.js";

export class World {
  entities: Entity[] = [];

  create(...components: Array<AnyComponentValuesPair | Tag>): Entity {
    const entity = new Entity().add(...components);
    this.insert(entity);
    return entity;
  }


  insert(entity: Entity) {
    this.entities.push(entity);
  }


  remove(entity: Entity) {
    this.entities.filter((e) => e !== entity);
    entity.destroy();
  }

  query<Input extends QueryArrayInput>(
    ...input: Input
  ): QueryOutput<Input>;

  query<Input extends QueryObjectInput>(
    input: Input
  ): QueryOutput<Input>;

  query<Input extends QueryInput>(
    ...input: SpreadOrObjectQueryInput<Input>
  ): QueryOutput<Input> {
    throw new NotImplementedError();
  }
}
