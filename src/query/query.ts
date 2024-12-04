import { NotImplementedError } from "../utils/errors/not-implemented-error";
import type { Entity } from "../entity/index";
import type {
  QueryInput,
} from "./input";
import type { QueryPart } from "./part";
import type {
  QueryOutput,
} from "./output";

export function query<Input extends QueryInput<QueryPart>>(
  entities: Entity[],
  input: Input,
): QueryOutput<Input>[] {
  throw new NotImplementedError();
}
