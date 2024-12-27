import type { QueryInput } from "./input.ts";
import type {
  QueryOutputItem,
  QueryPartOutput,
} from "./output.ts";
import {
  type ComponentOrRelationship,
  Entity,
  EntityWildcardQuery,
} from "../entity/index.ts";
import {
  Component,
  ComponentInstanceQuery,
} from "../component/index.js";
import {
  Relationship,
  RelationshipInstanceQuery,
} from "../relationship/index.js";
import type { QueryPart } from "./part.js";
import { RelationshipWildcardQuery } from "../relationship/queries/relationship-wildcard-query.js";
import type { Class } from "../utils/class.js";
import { ComponentWildcardQuery } from "../component/queries/component-wildcard-query.js";

export type Pools = Record<string, Pool>;
export type Pool = () => Generator<Entity>;
export type Permutation = Record<string, Entity>;
export type EntityConstraint = (entity: Entity) => boolean;
export type PermutationConstraint = (permutation: Permutation) => boolean;
export type Constraints = { poolSpecific: Record<string, EntityConstraint[]>; crossPool: PermutationConstraint[] };
export type PermutationMapper<Input extends QueryInput> = (
  (permutation: Permutation, output: Partial<QueryOutputItem<Input>>) => void
  );
type PartMapper<Part extends QueryPart> = (part: Part) => QueryPartOutput<Part>;
export type OutputMapper<Input extends QueryInput> = (permutation: Permutation) => QueryOutputItem<Input>;
export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export const ENTITY_POOL = "__default_entity";
export const COMPONENT_POOL = "__default_component";
export const RELATIONSHIP_POOL = "__default_relationship";
export const getTargetPoolName = (index: number): string => `__default_target_${ index }`;
export const getInstancePoolName = (instance: Entity): string => `__instance_pool_${ instance.__id }`;

// TODO: Give this file a better name

export function parseInput<Input extends QueryInput>(
  input: Input,
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
  input: Input,
): Pools {
  // TODO
  return {};
}

export function parseConstraints<Input extends QueryInput>(
  input: Input,
): Constraints {
  // TODO
  return {
    poolSpecific: {},
    crossPool: [],
  };
}

export function parseMappers<Input extends QueryInput>(
  input: Input,
): PermutationMapper<Input>[] {
  const mappers: PermutationMapper<Input>[] = [];

  if (Array.isArray(input)) {
    for (let i = 0; i < input.length; i++) {
      const part = input[i];

      if (part === Entity) {
        mappers.push((permutation, output) => {
          const entity = permutation[ENTITY_POOL];

          // @ts-ignore for "Type instantiation is excessively deep and possibly infinite."
          (output[i] as any) = entity;
        });
      } else if (part === Component) {
        mappers.push((permutation, output) => {
          const entity = permutation[ENTITY_POOL];
          const component = permutation[COMPONENT_POOL] as Component<any>;

          const value = entity.get(component);

          (output[i] as any) = value;
        });
      } else if (part === Relationship) {
        mappers.push((permutation, output) => {
          const entity = permutation[ENTITY_POOL];
          const relationship = permutation[RELATIONSHIP_POOL] as Relationship<any>;

          const value = entity.get(relationship);

          (output[i] as any) = value;
        });
      } else if (part instanceof Relationship) {
        mappers.push((permutation, output) => {
          const entity = permutation[ENTITY_POOL];
          const relationship = permutation[RELATIONSHIP_POOL] as Relationship<any>;

          const value = entity.get(relationship);

          (output[i] as any) = value;
        });
      } else if (part instanceof Component) {
        mappers.push((permutation, output) => {
          const entity = permutation[ENTITY_POOL];
          const component = permutation[COMPONENT_POOL] as Component<any>;

          const value = entity.get(component);

          (output[i] as any) = value;
        });
      } else if (part instanceof Entity) {

      } else if (part instanceof RelationshipWildcardQuery) {

      } else if (part instanceof ComponentWildcardQuery) {

      } else if (part instanceof EntityWildcardQuery) {

      } else if (part instanceof RelationshipInstanceQuery) {

      } else if (part instanceof ComponentInstanceQuery) {

      } else {
        throw new Error(`Unknown part: ${ part }`);
      }
    }
  } else {
    for (const key in input) {
      const part = input[key];
    }
  }

  return mappers;
}

export function combineMappers<Input extends QueryInput>(
  input: Input,
  mappers: PermutationMapper<Input>[],
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
    poolKeys.slice(1).map((key) => [ key, pools[key] ]),
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
  constraints: Record<string, EntityConstraint[]>,
): Pools {
  const filteredPools: Pools = {};

  for (const key in pools) {
    const poolConstraints = constraints[key] ?? [];

    const predicate = (entity: Entity) => (
      poolConstraints.every((constraint) => constraint(entity))
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

export const isA = (expected: Class<any>): EntityConstraint => {
  const constraint = (entity: Entity): boolean => {
    return entity instanceof expected;
  };

  return constraint;
};

export const is = (expected: Entity): EntityConstraint => {
  const constraint = (entity: Entity): boolean => {
    return entity === expected;
  };

  return constraint;
};

export const has = (expected: ComponentOrRelationship): EntityConstraint => {
  const constraint = (entity: Entity): boolean => {
    return entity.has(expected);
  };

  return constraint;
};

export const poolHasPool = (entityPool: string, componentPool: string): PermutationConstraint => {
  const constraint = (permutation: Permutation): boolean => {
    const entity = permutation[entityPool];

    if (!entity) {
      return false;
    }

    const component = permutation[componentPool];

    if (!component) {
      return false;
    }

    if (
      !(entity instanceof Component) ||
      !(component instanceof Component)
    ) {
      return false;
    }

    return entity.has(component);
  };

  return constraint;
}

export const poolTargetsPool = (
  sourcePool: string,
  relationshipPool: string,
  targetPool: string,
): PermutationConstraint => {
  const constraint = (permutation: Permutation): boolean => {
    const source = permutation[sourcePool];

    if (!source) {
      return false;
    }

    const relationship = permutation[relationshipPool];

    if (!relationship) {
      return false;
    }

    if (
      !(source instanceof Relationship) ||
      !(relationship instanceof Relationship)
    ) {
      return false;
    }

    const target = permutation[targetPool];

    if (!target) {
      return false;
    }

    return source.has(relationship.to(target));
  };

  return constraint;
}
