import { Entity } from "../entity/index.ts";
import type { QueryArrayInput, QueryInput, QueryObjectInput, } from "./input.ts";
import type { QueryOutput, QueryOutputItem, } from "./output.ts";
import { createPools, filterPools, parseInput, permutePools, } from "./pools.ts";


export function query<Input extends QueryArrayInput>(
  entities: Entity[],
  input: [...Input],
): QueryOutput<Input>;

export function query<Input extends QueryObjectInput>(
  entities: Entity[],
  input: Input,
): QueryOutput<Input>;

export function* query<Input extends QueryInput>(
  entities: Entity[],
  input: Input,
): QueryOutput<Input> {
  const { poolInfos, constraints, outputMapper } = parseInput(input);

  const pools = createPools(entities, poolInfos);
  const filteredPools = filterPools(pools, constraints.poolSpecific);
  const permutations = permutePools(filteredPools);

  const seenEntities = new Map<string, Set<Entity>>();

  permutationLoop: for (const permutation of permutations) {
    for (const [poolName, entity] of Object.entries(permutation)) {
      if (entity == null) {
        continue;
      }

      if (seenEntities.get(poolName)?.has(entity)) {
        continue permutationLoop;
      }
    }

    const passesConstraints = constraints.crossPool.every(
      (constraint) => constraint(permutation),
    );

    if (!passesConstraints) {
      continue;
    }

    for (const [poolName, entity] of Object.entries(permutation)) {
      if (entity == null) {
        continue;
      }

      if (!seenEntities.has(poolName)) {
        seenEntities.set(poolName, new Set());
      }

      seenEntities.get(poolName)?.add(entity);
    }

    const output: QueryOutputItem<Input> = outputMapper(permutation);

    // @ts-ignore
    yield output;
  }
}
