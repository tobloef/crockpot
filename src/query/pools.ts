import type { QueryInput } from "./input.ts";
import type { QueryOutputItem, } from "./output.ts";
import { type ComponentOrRelationship, Entity, EntityWildcardQuery, } from "../entity/index.ts";
import { Component, ComponentInstanceQuery, } from "../component/index.js";
import { Relationship, RelationshipInstanceQuery, } from "../relationship/index.js";
import type { Class } from "../utils/class.js";
import type { QueryPart } from "./part.ts";
import { RelationshipWildcardValueQuery } from "../relationship/queries/relationship-wildcard-value-query.ts";
import { ComponentWildcardValueQuery } from "../component/queries/component-wildcard-value-query.ts";
import { RelationshipWildcardQuery } from "../relationship/queries/relationship-wildcard-query.ts";
import { ComponentWildcardQuery } from "../component/queries/component-wildcard-query.ts";

export type Pools = Record<string, Pool>;
export type Pool = () => Generator<Entity>;
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
  poolNames: string[];
  constraints: Constraints;
  outputMapper: OutputMapper<Input>;
} {
  const { poolNames, constraints, mappers } = parseQueryParts(input);
  const outputMapper = combineMappers(input, mappers);

  return {
    poolNames,
    constraints,
    outputMapper,
  }
}

type QueryPartHandler<Part extends QueryPart> = {
  predicate: (part: QueryPart) => part is Part;
  fn: (part: Part, index: number, key?: string) => {
    mapper: PermutationMapper<any>;
    constraints: Constraints;
    poolNames: string[];
  };
}

const relationshipInstanceQueryHandler: QueryPartHandler<RelationshipInstanceQuery<any>> = {
  predicate: (part): part is RelationshipInstanceQuery<any> => part instanceof RelationshipInstanceQuery,
  fn: (part, index, key) => {
    const mapperKey = key ?? index;

    const poolNames = [
      getInstancePoolName(part.relationship),
      part.source instanceof Entity
        ? getInstancePoolName(part.source)
        : (part.source ?? ENTITY_POOL),
      part.target instanceof Entity
        ? getInstancePoolName(part.target)
        : (part.target ?? getTargetPoolName(index)),
    ];

    const [relationshipPool, entityPool, targetPool] = poolNames;

    const mapper = createRelationshipMapper(mapperKey, relationshipPool, entityPool, targetPool);

    const constraints = {
      poolSpecific: {
        [relationshipPool]: [
          is(part.relationship),
        ],
        [entityPool]: part.source instanceof Entity
          ? [is(part.source), has(part.relationship)]
          : [has(part.relationship)],
        [targetPool]: part.target instanceof Entity
          ? [is(part.target)]
          : [],
      },
      crossPool: [
        poolTargetsPool(entityPool, relationshipPool, targetPool),
      ],
    };

    return { mapper, constraints, poolNames };
  },
};
const componentInstanceQueryHandler: QueryPartHandler<ComponentInstanceQuery<any>> = {
  predicate: (part): part is ComponentInstanceQuery<any> => part instanceof ComponentInstanceQuery,
  fn: (part, index, key) => {
    const mapperKey = key ?? index;

    const poolNames = [
      getInstancePoolName(part.component),
      part.source instanceof Entity
        ? getInstancePoolName(part.source)
        : (part.source ?? ENTITY_POOL),
    ];

    const [componentPool, entityPool] = poolNames;

    const mapper = createComponentMapper(mapperKey, componentPool, entityPool);

    const constraints = {
      poolSpecific: {
        [componentPool]: [
          is(part.component),
        ],
        [entityPool]: part.source instanceof Entity
          ? [is(part.source), has(part.component)]
          : [has(part.component)],
      },
      crossPool: [],
    };

    return { mapper, constraints, poolNames };
  },
};
const relationWildcardValueQueryHandler: QueryPartHandler<RelationshipWildcardValueQuery> = {
  predicate: (part): part is RelationshipWildcardValueQuery => part instanceof RelationshipWildcardValueQuery,
  fn: (part, index, key) => {
    const mapperKey = key ?? index;

    const poolNames = [
      part.typeName ?? RELATIONSHIP_POOL,
      part.source instanceof Entity
        ? getInstancePoolName(part.source)
        : (part.source ?? ENTITY_POOL),
      part.target instanceof Entity
        ? getInstancePoolName(part.target)
        : (part.target ?? getTargetPoolName(index)),
    ];

    const [relationshipPool, entityPool, targetPool] = poolNames;

    const mapper = createRelationshipMapper(mapperKey, relationshipPool, entityPool, targetPool);

    const constraints = {
      poolSpecific: {
        [relationshipPool]: [
          isA(Relationship),
        ],
        [entityPool]: part.source instanceof Entity
          ? [is(part.source)]
          : [],
        [targetPool]: part.target instanceof Entity
          ? [is(part.target)]
          : [],
      },
      crossPool: [
        poolTargetsPool(entityPool, relationshipPool, targetPool),
      ],
    };

    return { mapper, constraints, poolNames };
  }
};
const componentWildcardValueQueryHandler: QueryPartHandler<ComponentWildcardValueQuery> = {
  predicate: (part): part is ComponentWildcardValueQuery => part instanceof ComponentWildcardValueQuery,
  fn: (part, index, key) => {
    const mapperKey = key ?? index;

    const poolNames = [
      part.typeName ?? COMPONENT_POOL,
      part.source instanceof Entity
        ? getInstancePoolName(part.source)
        : (part.source ?? ENTITY_POOL),
    ];

    const [componentPool, entityPool] = poolNames;

    const mapper = createComponentMapper(mapperKey, componentPool, entityPool);

    const constraints = {
      poolSpecific: {
        [componentPool]: [
          isA(Component),
        ],
        [entityPool]: part.source instanceof Entity
          ? [is(part.source)]
          : [],
      },
      crossPool: [
        poolHasPool(entityPool, componentPool),
      ],
    };

    return { mapper, constraints, poolNames };
  }
};
const relationshipWildcardQueryHandler: QueryPartHandler<RelationshipWildcardQuery> = {
  predicate: (part): part is RelationshipWildcardQuery => part instanceof RelationshipWildcardQuery,
  fn: (part, index, key) => {
    const mapperKey = key ?? index;

    const poolNames = [
      part.name ?? RELATIONSHIP_POOL,
      part.source instanceof Entity
        ? getInstancePoolName(part.source)
        : (part.source ?? ENTITY_POOL),
      part.target instanceof Entity
        ? getInstancePoolName(part.target)
        : (part.target ?? getTargetPoolName(index)),
    ];

    const [relationshipPool, entityPool, targetPool] = poolNames;

    const mapper = createRelationshipMapper(mapperKey, relationshipPool, entityPool, targetPool);

    const constraints = {
      poolSpecific: {
        [relationshipPool]: [
          isA(Relationship),
        ],
        [entityPool]: part.source instanceof Entity
          ? [is(part.source)]
          : [],
        [targetPool]: part.target instanceof Entity
          ? [is(part.target)]
          : [],
      },
      crossPool: [
        poolTargetsPool(entityPool, relationshipPool, targetPool),
      ],
    };

    return { mapper, constraints, poolNames };
  }
};
const componentWildcardQueryHandler: QueryPartHandler<ComponentWildcardQuery> = {
  predicate: (part): part is ComponentWildcardQuery => part instanceof ComponentWildcardQuery,
  fn: (part, index, key) => {
    const mapperKey = key ?? index;

    const poolNames = [
      part.name ?? COMPONENT_POOL,
      part.source instanceof Entity
        ? getInstancePoolName(part.source)
        : (part.source ?? ENTITY_POOL),
    ];

    const [componentPool, entityPool] = poolNames;

    const mapper = createComponentMapper(mapperKey, componentPool, entityPool);

    const constraints = {
      poolSpecific: {
        [componentPool]: [
          isA(Component),
        ],
        [entityPool]: part.source instanceof Entity
          ? [is(part.source)]
          : [],
      },
      crossPool: [
        poolHasPool(entityPool, componentPool),
      ],
    };

    return { mapper, constraints, poolNames };
  }
};
const entityWildcardQueryHandler: QueryPartHandler<EntityWildcardQuery> = {
  predicate: (part): part is EntityWildcardQuery => part instanceof EntityWildcardQuery,
  fn: (part, index, key) => {
    const mapperKey = key ?? index;

    const poolNames = [part.name ?? ENTITY_POOL];

    const [entityPool] = poolNames;

    const mapper = createEntityMapper(mapperKey, entityPool);

    const constraints = {
      poolSpecific: {
        [entityPool]: [],
      },
      crossPool: [],
    };

    return { mapper, constraints, poolNames };
  }
};
const relationshipHandler: QueryPartHandler<Relationship<unknown>> = {
  predicate: (part): part is Relationship<unknown> => part instanceof Relationship,
  fn: (part, index, key) => {
    const mapperKey = key ?? index;

    const poolNames = [getInstancePoolName(part), ENTITY_POOL, getTargetPoolName(index)];

    const [relationshipPool, entityPool, targetPool] = poolNames;

    const mapper = createRelationshipMapper(mapperKey, relationshipPool, entityPool, targetPool);

    const constraints = {
      poolSpecific: {
        [relationshipPool]: [
          isA(Relationship),
        ],
        [entityPool]: [
          has(part),
        ],
        [targetPool]: [],
      },
      crossPool: [
        poolTargetsPool(entityPool, relationshipPool, targetPool),
      ],
    };

    return { mapper, constraints, poolNames };
  }
};
const componentHandler: QueryPartHandler<Component<unknown>> = {
  predicate: (part): part is Component<unknown> => part instanceof Component,
  fn: (part, index, key) => {
    const mapperKey = key ?? index;

    const poolNames = [getInstancePoolName(part), ENTITY_POOL];

    const [componentPool, entityPool] = poolNames;

    const mapper = createComponentMapper(mapperKey, componentPool, entityPool);

    const constraints = {
      poolSpecific: {
        [componentPool]: [
          isA(Component),
        ],
        [entityPool]: [
          has(part),
        ],
      },
      crossPool: [],
    };

    return { mapper, constraints, poolNames };
  }
};

const relationshipClassHandler: QueryPartHandler<Class<Relationship<unknown>>> = {
  predicate: (part): part is Class<Relationship> => part === Relationship,
  fn: (part, index, key) => {
    const mapperKey = key ?? index;

    const poolNames = [RELATIONSHIP_POOL, ENTITY_POOL, getTargetPoolName(index)];

    const [relationshipPool, entityPool, targetPool] = poolNames;

    const mapper = createRelationshipMapper(mapperKey, relationshipPool, entityPool, targetPool);

    const constraints = {
      poolSpecific: {
        [relationshipPool]: [
          isA(Relationship),
        ],
        [entityPool]: [],
        [targetPool]: [],
      },
      crossPool: [
        poolTargetsPool(entityPool, relationshipPool, targetPool),
      ],
    };

    return { mapper, constraints, poolNames };
  }
};

const componentClassHandler: QueryPartHandler<Class<Component<unknown>>> = {
  predicate: (part): part is Class<Component> => part === Component,
  fn: (part, index, key) => {
    const mapperKey = key ?? index;

    const poolNames = [COMPONENT_POOL, ENTITY_POOL];

    const [componentPool, entityPool] = poolNames;

    const mapper = createComponentMapper(mapperKey, componentPool, entityPool);

    const constraints = {
      poolSpecific: {
        [componentPool]: [
          isA(Component),
        ],
        [entityPool]: [],
      },
      crossPool: [
        poolHasPool(entityPool, componentPool),
      ],
    };

    return { mapper, constraints, poolNames };
  }
};

const entityClassHandler: QueryPartHandler<Class<Entity>> = {
  predicate: (part): part is Class<Entity> => part === Entity,
  fn: (part, index, key) => {
    const mapperKey = key ?? index;

    const poolNames = [ENTITY_POOL];

    const [entityPool] = poolNames;

    const mapper = createEntityMapper(mapperKey, entityPool);

    const constraints = {
      poolSpecific: {
        [entityPool]: [],
      },
      crossPool: [],
    };

    return { mapper, constraints, poolNames };
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
  relationshipHandler,
  componentHandler,
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
  entityPool: string
): PermutationMapper<any> {
  return (permutation: Permutation, output: any) => {
    const component = permutation[componentPool] as Component<unknown>;
    const entity = permutation[entityPool];
    const value = entity.get(component);

    output[mapperKey] = value;
  };
}

function createRelationshipMapper(
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

export function parseQueryParts<Input extends QueryInput>(
  input: Input,
): {
  poolNames: string[];
  constraints: Constraints;
  mappers: PermutationMapper<Input>[];
} {
  const poolNames = new Set<string>();
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
        poolNames: partPoolNames
      } = handler.fn(part, index, key);

      for (const poolName of partPoolNames) {
        poolNames.add(poolName);
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
    poolNames: Array.from(poolNames),
    constraints,
    mappers,
  };
}

export function parsePoolNames<Input extends QueryInput>(
  input: Input,
): string[] {
  const { poolNames } = parseQueryParts(input);

  return poolNames;
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

export function createPools(entities: Entity[], poolNames: string[]): Pools {
  const pools: Pools = {};

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
