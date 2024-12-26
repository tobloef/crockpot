import type { Entity } from "../entity/index.ts";
import type { QueryInput } from "./input.ts";
import type { QueryOutputItem } from "./output.ts";
import { Component } from "../component/index.js";
import { Relationship } from "../relationship/index.js";
export type Pools = Record<string, Pool>;
export type Pool = () => Generator<Entity>;
export type Permutation = Record<string, Entity>;
export type Constraint = (permutation: Permutation) => boolean;
export type Constraints = { poolSpecific: Record<string, Constraint[]>; crossPool: Constraint[] };
export type Mapper<Input extends QueryInput> = (
  (permutation: Permutation, output: Partial<QueryOutputItem<Input>>) => void
);
export type OutputMapper<Input extends QueryInput> = (permutation: Permutation) => QueryOutputItem<Input>;
export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export const DEFAULT_ENTITY_POOL = "__default_entity";
export const DEFAULT_COMPONENT_POOL = "__default_component";
export const DEFAULT_RELATIONSHIP_POOL = "__default_relationship";

// TODO: Give this file a better name

export function parseInput<Input extends QueryInput>(
  input: Input
): {
  pools: Pools;
  constraints: Constraints;
  outputMapper: OutputMapper<Input>;
} {
  const pools = parsePools(input);
  const constraints = parseConstraints(input);
  const mappers = parseMappers(input);
  const outputMapper = combineMappers(input, mappers);

  return {
    pools,
    constraints,
    outputMapper,
  }
}

export function parsePools<Input extends QueryInput>(
  input: Input
): Pools {
  // TODO
  return {};
}

export function parseConstraints<Input extends QueryInput>(
  input: Input
): Constraints {
  // TODO
  return {
    poolSpecific: {},
    crossPool: [],
  };
}

export function parseMappers<Input extends QueryInput>(
  input: Input
): Mapper<Input>[] {
  // TODO
  return [];
}

export function combineMappers<Input extends QueryInput>(
  input: Input,
  mappers: Mapper<Input>[]
): OutputMapper<Input> {
  return (permutation: Permutation): QueryOutputItem<Input> => {
    const output = Array.isArray(input) ? [] : {};

    for (const mapper of mappers) {
      // @ts-ignore
      mapper(permutation, output);
    }

    return output as QueryOutputItem<Input>;
  }
}


export function* permutePools(pools: Pools): Generator<Permutation> {
  if (Object.keys(pools).length === 0) {
    return;
  }

  const poolKeys = Object.keys(pools);
  const firstKey = poolKeys[0];
  const firstPool = pools[firstKey];
  const otherPools = Object.fromEntries(
    poolKeys.slice(1).map((key) => [key, pools[key]])
  );

  for (const entity of firstPool()) {
    if (Object.keys(otherPools).length === 0) {
      const permutation = { [firstKey]: entity };
      yield permutation;
    } else {
      const otherPermutations = permutePools(otherPools);

      for (const otherPermutation of otherPermutations) {
        const permutation = { [firstKey]: entity, ...otherPermutation };
        yield permutation;
      }
    }
  }
}

export function filterPools(
  pools: Pools,
  constraints: Record<string, Constraint[]>
): Pools {
  const filteredPools: Pools = {};

  for (const key in pools) {
    const poolConstraints = constraints[key] ?? [];

    const predicate = (entity: Entity) => (
      poolConstraints.every((constraint) => constraint({ [key]: entity }))
    );

    filteredPools[key] = () => filterGenerator(pools[key](), predicate);
  }

  return filteredPools;
}

export function* filterGenerator<T>(generator: Generator<T>, predicate: (x: T) => boolean): Generator<T> {
  for (const item of generator) {
    if (predicate(item)) {
      yield item;
    }
  }
}

export const isComponent: Constraint = (permutation: Permutation): boolean => {
  return Object.values(permutation).every((entity) => entity instanceof Component);
}

export const isRelationship: Constraint = (permutation: Permutation): boolean => {
  return Object.values(permutation).every((entity) => entity instanceof Component);
}

export const is = (entity: Entity): Constraint => {
  const constraint = (permutation: Permutation): boolean => {
    return Object.values(permutation).every((pEntity) => pEntity === entity);
  };

  constraint.__entity = entity;

  return constraint;
}

export const has = (entity: Component<any> | Relationship<any>): Constraint => {
  const constraint = (permutation: Permutation): boolean => {
    return Object.values(permutation).some((entity) => {
      if (
        entity instanceof Component ||
        entity instanceof Relationship
      ) {
        return entity.has(entity);
      } else {
        return false;
      }
    });
  };

  constraint.__entity = entity;

  return constraint;
}
