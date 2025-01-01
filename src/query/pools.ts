import type { QueryInput } from "./input.ts";
import type { QueryOutputItem, } from "./output.ts";
import { Entity } from "../entity/index.ts";
import { Component, ComponentInstanceQuery, } from "../component/index.ts";
import { Relationship, RelationshipInstanceQuery, } from "../relationship/index.ts";
import type { Class } from "../utils/class.ts";
import type { QueryPart } from "./part.ts";
import { RelationshipWildcardValueQuery } from "../relationship/queries/relationship-wildcard-value-query.ts";
import { ComponentWildcardValueQuery } from "../component/queries/component-wildcard-value-query.ts";
import { RelationshipWildcardQuery } from "../relationship/queries/relationship-wildcard-query.ts";
import { ComponentWildcardQuery } from "../component/queries/component-wildcard-query.ts";
import { EntityWildcardQuery } from "../entity/queries/entity-wildcard-query.ts";

export type Pools = Record<string, Pool>;
export type Pool = () => Generator<Entity>;
export type PoolInfos = Record<string, { isOnce: boolean; }>;
export type Permutation = Record<string, Entity>;
export type EntityConstraint = (entity: Entity) => boolean;
export type PermutationConstraint = (permutation: Permutation) => boolean;
export type Constraints = { poolSpecific: Record<string, EntityConstraint[]>; crossPool: PermutationConstraint[] };
export type PermutationMapper<Input extends QueryInput> = (
  (permutation: Permutation, output: Partial<QueryOutputItem<Input>>) => void
  );
export type OutputMapper<Input extends QueryInput> = (permutation: Permutation) => QueryOutputItem<Input>;
export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export const ENTITY_POOL = "__default_entity";
export const COMPONENT_POOL = "__default_component";
export const RELATIONSHIP_POOL = "__default_relationship";
export const getTargetPoolName = (index: number): string => `__default_target_${index}`;
export const getInstancePoolName = (instance: Entity): string => `__instance_pool_${instance.__id}`;

// TODO: Give this file a better name

export function parseInput<Input extends QueryInput>(
  input: Input,
): {
  poolInfos: PoolInfos;
  constraints: Constraints;
  outputMapper: OutputMapper<Input>;
} {
  const { poolInfos, constraints, mappers } = parseQueryParts(input);
  const outputMapper = combineMappers(input, mappers);

  return {
    poolInfos,
    constraints,
    outputMapper,
  }
}

type QueryPartHandler<Part extends QueryPart> = {
  predicate: (part: QueryPart) => part is Part;
  fn: (part: Part, index: number, key?: string) => {
    mapper: PermutationMapper<any>;
    constraints: Constraints;
    poolInfos: PoolInfos;
  };
}

const relationshipInstanceQueryHandler: QueryPartHandler<RelationshipInstanceQuery<any>> = {
  predicate: (part): part is RelationshipInstanceQuery<any> => part instanceof RelationshipInstanceQuery,
  fn: (part, index, key) => {
    const mapperKey = key ?? index;

    const poolInfos: PoolInfos = {
      [(
        part.source instanceof Entity
          ? getInstancePoolName(part.source)
          : (part.source ?? ENTITY_POOL)
      )]: { isOnce: false },
      [(
        part.target instanceof Entity
          ? getInstancePoolName(part.target)
          : (part.target ?? getTargetPoolName(index))
      )]: { isOnce: false },
    };

    const [entityPool, targetPool] = Object.keys(poolInfos);

    const mapper = createRelationshipInstanceValueMapper(mapperKey, part.relationship, entityPool, targetPool);

    const constraints = {
      poolSpecific: {
        [entityPool]: part.source instanceof Entity
          ? [constraintFunctions.is(part.source), constraintFunctions.has(part.relationship)]
          : [constraintFunctions.has(part.relationship)],
        [targetPool]: part.target instanceof Entity
          ? [constraintFunctions.is(part.target)]
          : [],
      },
      crossPool: [
        constraintFunctions.poolTargetsPoolByInstance(entityPool, part.relationship, targetPool),
      ],
    };

    return { mapper, constraints, poolInfos };
  },
};

const componentInstanceQueryHandler: QueryPartHandler<ComponentInstanceQuery<any>> = {
  predicate: (part): part is ComponentInstanceQuery<any> => part instanceof ComponentInstanceQuery,
  fn: (part, index, key) => {
    const mapperKey = key ?? index;

    const poolInfos: PoolInfos = {
      [(
        part.source instanceof Entity
          ? getInstancePoolName(part.source)
          : (part.source ?? ENTITY_POOL)
      )]: { isOnce: false },
    }

    const [entityPool] = Object.keys(poolInfos);

    const mapper = createComponentInstanceValueMapper(mapperKey, part.component, entityPool);

    const constraints = {
      poolSpecific: {
        [entityPool]: part.source instanceof Entity
          ? [constraintFunctions.is(part.source), constraintFunctions.has(part.component)]
          : [constraintFunctions.has(part.component)],
      },
      crossPool: [],
    };

    return { mapper, constraints, poolInfos };
  },
};

const relationWildcardValueQueryHandler: QueryPartHandler<RelationshipWildcardValueQuery> = {
  predicate: (part): part is RelationshipWildcardValueQuery => part instanceof RelationshipWildcardValueQuery,
  fn: (part, index, key) => {
    const mapperKey = key ?? index;

    const poolInfos: PoolInfos = {
      [part.typeName ?? RELATIONSHIP_POOL]: { isOnce: part.isOnce },
      [(
        part.source instanceof Entity
          ? getInstancePoolName(part.source)
          : (part.source ?? ENTITY_POOL)
      )]: { isOnce: false },
      [(
        part.target instanceof Entity
          ? getInstancePoolName(part.target)
          : (part.target ?? getTargetPoolName(index))
      )]: { isOnce: false },
    };

    const [relationshipPool, entityPool, targetPool] = Object.keys(poolInfos);

    const mapper = createRelationshipPoolValueMapper(mapperKey, relationshipPool, entityPool, targetPool);

    const constraints = {
      poolSpecific: {
        [relationshipPool]: [
          constraintFunctions.isA(Relationship),
        ],
        [entityPool]: part.source instanceof Entity
          ? [constraintFunctions.is(part.source)]
          : [],
        [targetPool]: part.target instanceof Entity
          ? [constraintFunctions.is(part.target)]
          : [],
      },
      crossPool: [
        constraintFunctions.poolTargetsPoolByPool(entityPool, relationshipPool, targetPool),
      ],
    };

    return { mapper, constraints, poolInfos };
  }
};

const componentWildcardValueQueryHandler: QueryPartHandler<ComponentWildcardValueQuery> = {
  predicate: (part): part is ComponentWildcardValueQuery => part instanceof ComponentWildcardValueQuery,
  fn: (part, index, key) => {
    const mapperKey = key ?? index;

    const poolInfos: PoolInfos = {
      [part.typeName ?? COMPONENT_POOL]: { isOnce: part.isOnce },
      [(
        part.source instanceof Entity
          ? getInstancePoolName(part.source)
          : (part.source ?? ENTITY_POOL)
      )]: { isOnce: false },
    }

    const [componentPool, entityPool] = Object.keys(poolInfos);

    const mapper = createComponentPoolValueMapper(mapperKey, componentPool, entityPool);

    const constraints = {
      poolSpecific: {
        [componentPool]: [
          constraintFunctions.isA(Component),
        ],
        [entityPool]: part.source instanceof Entity
          ? [constraintFunctions.is(part.source)]
          : [],
      },
      crossPool: [
        constraintFunctions.poolHasPool(entityPool, componentPool),
      ],
    };

    return { mapper, constraints, poolInfos };
  }
};

const relationshipWildcardQueryHandler: QueryPartHandler<RelationshipWildcardQuery> = {
  predicate: (part): part is RelationshipWildcardQuery => part instanceof RelationshipWildcardQuery,
  fn: (part, index, key) => {
    const mapperKey = key ?? index;


    const poolInfos: PoolInfos = {
      [part.name ?? RELATIONSHIP_POOL]: { isOnce: part.isOnce },
    };

    const [relationshipPool] = Object.keys(poolInfos);

    const mapper = createRelationshipMapper(mapperKey, relationshipPool);

    const constraints: Constraints = {
      poolSpecific: {
        [relationshipPool]: [
          constraintFunctions.isA(Relationship),
        ],
      },
      crossPool: [],
    };

    if (part.source !== undefined || part.target !== undefined) {
      const sourcePoolName = (
        part.source instanceof Entity
          ? getInstancePoolName(part.source)
          : (part.source ?? ENTITY_POOL)
      );

      const targetPoolName = (
        part.target instanceof Entity
          ? getInstancePoolName(part.target)
          : (part.target ?? getTargetPoolName(index))
      );

      poolInfos[sourcePoolName] = { isOnce: false }
      poolInfos[targetPoolName] = { isOnce: false };

      constraints.poolSpecific[sourcePoolName] = part.source instanceof Entity
        ? [constraintFunctions.is(part.source)]
        : [];

      constraints.poolSpecific[targetPoolName] = part.target instanceof Entity
        ? [constraintFunctions.is(part.target)]
        : [];

      constraints.crossPool.push(
        constraintFunctions.poolTargetsPoolByPool(sourcePoolName, relationshipPool, targetPoolName)
      );
    }

    return { mapper, constraints, poolInfos };
  }
};
const componentWildcardQueryHandler: QueryPartHandler<ComponentWildcardQuery> = {
  predicate: (part): part is ComponentWildcardQuery => part instanceof ComponentWildcardQuery,
  fn: (part, index, key) => {
    const mapperKey = key ?? index;

    const poolInfos: PoolInfos = {
      [part.name ?? COMPONENT_POOL]: { isOnce: part.isOnce },
    }

    const [componentPool] = Object.keys(poolInfos);

    const mapper = createComponentMapper(mapperKey, componentPool);

    const constraints: Constraints = {
      poolSpecific: {
        [componentPool]: [
          constraintFunctions.isA(Component),
        ],
      },
      crossPool: [],
    };

    if (part.source !== undefined) {
      const sourcePoolName = (
        part.source instanceof Entity
          ? getInstancePoolName(part.source)
          : (part.source ?? ENTITY_POOL)
      );

      poolInfos[sourcePoolName] = { isOnce: false };

      constraints.poolSpecific[sourcePoolName] = part.source instanceof Entity
        ? [constraintFunctions.is(part.source)]
        : [];

      constraints.crossPool.push(
        constraintFunctions.poolHasPool(sourcePoolName, componentPool)
      );
    }

    return { mapper, constraints, poolInfos };
  }
};
const entityWildcardQueryHandler: QueryPartHandler<EntityWildcardQuery> = {
  predicate: (part): part is EntityWildcardQuery => part instanceof EntityWildcardQuery,
  fn: (part, index, key) => {
    const mapperKey = key ?? index;

    const poolInfos: PoolInfos = {
      [part.name ?? ENTITY_POOL]: { isOnce: part.isOnce },
    };

    const [entityPool] = Object.keys(poolInfos);

    const mapper = createEntityMapper(mapperKey, entityPool);

    const constraints = {
      poolSpecific: {
        [entityPool]: [],
      },
      crossPool: [],
    };

    return { mapper, constraints, poolInfos };
  }
};
const relationshipInstanceHandler: QueryPartHandler<Relationship<unknown>> = {
  predicate: (part): part is Relationship<unknown> => part instanceof Relationship,
  fn: (part, index, key) => {
    const mapperKey = key ?? index;

    const poolInfos: PoolInfos = {
      [ENTITY_POOL]: { isOnce: false },
      [getTargetPoolName(index)]: { isOnce: false },
    };

    const [entityPool, targetPool] = Object.keys(poolInfos);

    const mapper = createRelationshipInstanceValueMapper(mapperKey, part, entityPool, targetPool);

    const constraints = {
      poolSpecific: {
        [entityPool]: [
          constraintFunctions.has(part),
        ],
        [targetPool]: [],
      },
      crossPool: [
        constraintFunctions.poolTargetsPoolByInstance(entityPool, part, targetPool),
      ],
    };

    return { mapper, constraints, poolInfos };
  }
};
const componentInstanceHandler: QueryPartHandler<Component<unknown>> = {
  predicate: (part): part is Component<unknown> => part instanceof Component,
  fn: (part, index, key) => {
    const mapperKey = key ?? index;

    const poolInfos: PoolInfos = {
      [ENTITY_POOL]: { isOnce: false },
    };

    const [entityPool] = Object.keys(poolInfos);

    const mapper = createComponentInstanceValueMapper(mapperKey, part, entityPool);

    const constraints = {
      poolSpecific: {
        [entityPool]: [
          constraintFunctions.has(part),
        ],
      },
      crossPool: [],
    };

    return { mapper, constraints, poolInfos };
  }
};

const relationshipClassHandler: QueryPartHandler<Class<Relationship<unknown>>> = {
  predicate: (part): part is Class<Relationship> => part === Relationship,
  fn: (part, index, key) => {
    const mapperKey = key ?? index;

    const poolInfos: PoolInfos = {
      [RELATIONSHIP_POOL]: { isOnce: false },
    }

    const [relationshipPool] = Object.keys(poolInfos);

    const mapper = createRelationshipMapper(mapperKey, relationshipPool);

    const constraints = {
      poolSpecific: {
        [relationshipPool]: [
          constraintFunctions.isA(Relationship),
        ],
      },
      crossPool: [],
    };

    return { mapper, constraints, poolInfos };
  }
};

const componentClassHandler: QueryPartHandler<Class<Component<unknown>>> = {
  predicate: (part): part is Class<Component> => part === Component,
  fn: (part, index, key) => {
    const mapperKey = key ?? index;

    const poolInfos: PoolInfos = {
      [COMPONENT_POOL]: { isOnce: false },
    }

    const [componentPool] = Object.keys(poolInfos);

    const mapper = createComponentMapper(mapperKey, componentPool);

    const constraints = {
      poolSpecific: {
        [componentPool]: [
          constraintFunctions.isA(Component),
        ],
      },
      crossPool: [],
    };

    return { mapper, constraints, poolInfos };
  }
};

const entityClassHandler: QueryPartHandler<Class<Entity>> = {
  predicate: (part): part is Class<Entity> => part === Entity,
  fn: (part, index, key) => {
    const mapperKey = key ?? index;

    const poolInfos: PoolInfos = {
      [ENTITY_POOL]: { isOnce: false },
    }

    const [entityPool] = Object.keys(poolInfos);

    const mapper = createEntityMapper(mapperKey, entityPool);

    const constraints = {
      poolSpecific: {
        [entityPool]: [],
      },
      crossPool: [],
    };

    return { mapper, constraints, poolInfos };
  }
};

const queryPartHandlers: QueryPartHandler<any>[] = [
  relationshipInstanceQueryHandler,
  componentInstanceQueryHandler,
  relationWildcardValueQueryHandler,
  componentWildcardValueQueryHandler,
  relationshipWildcardQueryHandler,
  componentWildcardQueryHandler,
  entityWildcardQueryHandler,
  relationshipInstanceHandler,
  componentInstanceHandler,
  relationshipClassHandler,
  componentClassHandler,
  entityClassHandler,
];

function createEntityMapper(
  mapperKey: number | string,
  entityPool: string
): PermutationMapper<any> {
  return (permutation: Permutation, output: any) => {
    const entity = permutation[entityPool];
    output[mapperKey] = entity;
  };
}

function createComponentMapper(
  mapperKey: number | string,
  componentPool: string,
): PermutationMapper<any> {
  return (permutation: Permutation, output: any) => {
    const component = permutation[componentPool] as Component<unknown>;

    output[mapperKey] = component;
  };
}

function createRelationshipMapper(
  mapperKey: number | string,
  relationshipPool: string,
): PermutationMapper<any> {
  return (permutation: Permutation, output: any) => {
    const relationship = permutation[relationshipPool] as Relationship<unknown>;

    output[mapperKey] = relationship;
  };
}

function createComponentInstanceValueMapper(
  mapperKey: number | string,
  component: Component<unknown>,
  entityPool: string
): PermutationMapper<any> {
  return (permutation: Permutation, output: any) => {
    const entity = permutation[entityPool];
    const value = entity.get(component);

    output[mapperKey] = value;
  };
}

function createComponentPoolValueMapper(
  mapperKey: number | string,
  componentPool: string,
  entityPool: string
): PermutationMapper<any> {
  return (permutation: Permutation, output: any) => {
    const component = permutation[componentPool] as Component<unknown>;
    const entity = permutation[entityPool];
    const value = entity.get(component);

    output[mapperKey] = value;
  };
}

function createRelationshipPoolValueMapper(
  mapperKey: number | string,
  relationshipPool: string,
  entityPool: string,
  targetPool: string
): PermutationMapper<any> {
  return (permutation: Permutation, output: any) => {
    const relationship = permutation[relationshipPool] as Relationship<unknown>;
    const entity = permutation[entityPool];
    const target = permutation[targetPool];
    const value = entity.get(relationship.to(target));

    output[mapperKey] = value;
  };
}

function createRelationshipInstanceValueMapper(
  mapperKey: number | string,
  relationship: Relationship<unknown>,
  entityPool: string,
  targetPool: string
): PermutationMapper<any> {
  return (permutation: Permutation, output: any) => {
    const entity = permutation[entityPool];
    const target = permutation[targetPool];
    const value = entity.get(relationship.to(target));

    output[mapperKey] = value;
  };
}

export function parseQueryParts<Input extends QueryInput>(
  input: Input,
): {
  poolInfos: PoolInfos;
  constraints: Constraints;
  mappers: PermutationMapper<Input>[];
} {
  const poolInfos: PoolInfos = {};
  const constraints: Constraints = {
    poolSpecific: {},
    crossPool: [],
  };
  const mappers: PermutationMapper<Input>[] = [];

  const keys = Array.isArray(input) ? [] : Object.keys(input);
  const parts: QueryPart[] = Array.isArray(input) ? input : Object.values(input);

  for (let index = 0; index < parts.length; index++) {
    const part = parts[index];
    const key = keys[index];

    let foundHandler = false;

    for (const handler of queryPartHandlers) {
      if (!handler.predicate(part)) {
        continue;
      }

      foundHandler = true;

      const {
        mapper: partMapper,
        constraints: partConstraints,
        poolInfos: partPoolInfos,
      } = handler.fn(part, index, key);

      for (const [poolName, poolInfo] of Object.entries(partPoolInfos)) {
        if (poolInfos[poolName] === undefined) {
          poolInfos[poolName] = poolInfo;
        } else {
          poolInfos[poolName] = {
            isOnce: poolInfos[poolName].isOnce || poolInfo.isOnce,
          }
        }
      }

      mappers.push(partMapper);

      for (const poolName in partConstraints.poolSpecific) {
        if (!constraints.poolSpecific[poolName]) {
          constraints.poolSpecific[poolName] = [];
        }

        constraints.poolSpecific[poolName].push(...partConstraints.poolSpecific[poolName]);
      }

      constraints.crossPool.push(...partConstraints.crossPool);

      break;
    }

    if (!foundHandler) {
      throw new Error(`Invalid query part: ${part}`);
    }
  }

  return {
    poolInfos,
    constraints,
    mappers,
  };
}

export function parsePoolInfos<Input extends QueryInput>(
  input: Input,
): PoolInfos {
  const { poolInfos } = parseQueryParts(input);

  return poolInfos;
}

export function parseConstraints<Input extends QueryInput>(
  input: Input,
): Constraints {
  const { constraints } = parseQueryParts(input);

  return constraints;
}

export function parseMappers<Input extends QueryInput>(
  input: Input,
): PermutationMapper<Input>[] {
  const { mappers } = parseQueryParts(input);

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

export function createPools(entities: Entity[], poolInfos: PoolInfos): Pools {
  const pools: Pools = {};

  const poolNames = Object.keys(poolInfos);

  for (const poolName of poolNames) {
    pools[poolName] = () => arrayToGenerator(entities);
  }

  return pools;
}

export function* arrayToGenerator<T>(array: T[]): Generator<T> {
  for (const item of array) {
    yield item;
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
    poolKeys.slice(1).map((key) => [key, pools[key]]),
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

export const constraintFunctions = {
  isA,
  is,
  has,
  poolHasPool,
  poolTargetsPoolByPool,
  poolTargetsPoolByInstance,
};

function isA(expected: Class<any>): EntityConstraint {
  const constraint = (entity: Entity): boolean => {
    return entity instanceof expected;
  };

  return constraint;
}

function is(expected: Entity): EntityConstraint {
  const constraint = (entity: Entity): boolean => {
    return entity === expected;
  };

  return constraint;
}

function has(expected: Component<any> | Relationship<any>): EntityConstraint {
  const constraint = (entity: Entity): boolean => {
    return entity.has(expected);
  };

  return constraint;
}

function poolHasPool(entityPool: string, componentPool: string): PermutationConstraint {
  const constraint = (permutation: Permutation): boolean => {
    const entity = permutation[entityPool];

    if (!entity) {
      return false;
    }

    const component = permutation[componentPool];

    if (!component) {
      return false;
    }

    if (!(component instanceof Component)) {
      return false;
    }

    return entity.has(component);
  };

  return constraint;
}

function poolTargetsPoolByPool(
  sourcePool: string,
  relationshipPool: string,
  targetPool: string,
): PermutationConstraint {
  const constraint = (permutation: Permutation): boolean => {
    const source = permutation[sourcePool];

    if (!source) {
      return false;
    }

    const relationship = permutation[relationshipPool];

    if (!relationship) {
      return false;
    }

    if (!(relationship instanceof Relationship)) {
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

function poolTargetsPoolByInstance(
  sourcePool: string,
  relationship: Relationship<unknown>,
  targetPool: string,
): PermutationConstraint {
  const constraint = (permutation: Permutation): boolean => {
    const source = permutation[sourcePool];

    if (!source) {
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

