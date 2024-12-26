import { Entity } from "../entity/index.ts";
import type { QueryArrayInput, QueryInput, QueryObjectInput, } from "./input.ts";
import type { QueryPart } from "./part.ts";
import type { QueryOutput, QueryOutputItem } from "./output.ts";
import { filterPools, parseInput, permutePools } from "./pools.ts";

export function query<Input extends QueryArrayInput<QueryPart>>(
  entities: Entity[],
  input: [...Input]
): QueryOutput<Input>;

export function query<Input extends QueryObjectInput<QueryPart>>(
  entities: Entity[],
  input: Input
): QueryOutput<Input>;

export function* query<Input extends QueryInput>(
  entities: Entity[],
  input: Input,
): QueryOutput<Input> {
  const { pools, constraints, outputMapper } = parseInput(input);

  const filteredPools = filterPools(pools, constraints.poolSpecific);
  const permutations = permutePools(filteredPools);

  for (const permutation of permutations) {
    const passesConstraints = constraints.crossPool.every(
      (constraint) => constraint(permutation)
    );

    if (!passesConstraints) {
      continue;
    }

    const output: QueryOutputItem<Input> = outputMapper(permutation);

    yield output;
  }
}


