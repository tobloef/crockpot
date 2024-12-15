import { NotImplementedError } from "../utils/errors/not-implemented-error.ts";
import type { Entity } from "../entity/index.ts";
import type { QueryArrayInput, QueryInput, QueryObjectInput, } from "./input.ts";
import type { QueryPart } from "./part.ts";
import type { QueryOutput } from "./output.ts";

export function query<Input extends QueryPart>(
  entities: Entity[],
  input: Input
): QueryOutput<Input>;

export function query<Input extends QueryArrayInput<QueryPart>>(
  entities: Entity[],
  input: [...Input]
): QueryOutput<Input>;

export function query<Input extends QueryObjectInput<QueryPart>>(
  entities: Entity[],
  input: Input
): QueryOutput<Input>;

export function query<Input extends QueryInput>(
  entities: Entity[],
  input: Input,
): QueryOutput<Input> {
  throw new NotImplementedError();
}
