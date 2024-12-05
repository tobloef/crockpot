import { NotImplementedError } from "../utils/errors/not-implemented-error.ts";
import type { Entity } from "../entity/index.ts";
import type {
  QueryInput,
} from "./input.ts";
import type { QueryPart } from "./part.ts";
import type { QueryOutput } from "./output.ts";

export function query<Input extends QueryInput<QueryPart>>(
  entities: Entity[],
  input: Input,
): QueryOutput<Input>[] {
  throw new NotImplementedError();
}
