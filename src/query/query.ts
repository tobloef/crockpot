import { Entity } from "../entity/index.ts";
import type {
  QueryArrayInput,
  QueryInput,
  QueryObjectInput,
} from "./input.ts";
import type {
  QueryOutput,
  QueryOutputItem,
} from "./output.ts";
import {
  createPools,
  filterPools,
  parseInput,
  permutePools,
} from "./pools.ts";


export function query<Input extends QueryArrayInput>(
  entities: Entity[],
  input: [ ...Input ],
): QueryOutput<Input>;

export function query<Input extends QueryObjectInput>(
  entities: Entity[],
  input: Input,
): QueryOutput<Input>;

export function* query<Input extends QueryInput>(
  entities: Entity[],
  input: Input,
): QueryOutput<Input> {
  const { poolNames, constraints, outputMapper } = parseInput(input);

  const pools = createPools(entities, poolNames);
  const filteredPools = filterPools(pools, constraints.poolSpecific);
  const permutations = permutePools(filteredPools);

  for (const permutation of permutations) {
    const passesConstraints = constraints.crossPool.every(
      (constraint) => constraint(permutation),
    );

    if (!passesConstraints) {
      continue;
    }

    const output: QueryOutputItem<Input> = outputMapper(permutation);

    // @ts-ignore
    yield output;
  }
}
