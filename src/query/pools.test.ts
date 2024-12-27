import {
  describe,
  it,
} from "node:test";
import * as assert from "node:assert";
import {
  combineMappers,
  COMPONENT_POOL,
  type Constraints,
  ENTITY_POOL,
  type EntityConstraint,
  filterGenerator,
  filterPools,
  getInstancePoolName,
  getTargetPoolName,
  has,
  is,
  isA,
  parseConstraints,
  parseMappers,
  parsePools,
  type PermutationMapper,
  permutePools,
  poolHasPool,
  type Pools,
  poolTargetsPool,
  RELATIONSHIP_POOL,
} from "./pools.ts";
import { Entity } from "../entity/index.ts";
import type { QueryOutputItem } from "./output.ts";
import { Component } from "../component/index.ts";
import { Relationship } from "../relationship/index.ts";

describe(parsePools.name, () => {
  it("Parses entity class for arrays", () => {
    // Arrange
    const input = [ Entity ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ ENTITY_POOL ]);
  });

  it("Parses entity class for objects", () => {
    // Arrange
    const input = { x: Entity } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ ENTITY_POOL ]);
  });

  it("Parses component class for arrays", () => {
    // Arrange
    const input = [ Component ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ COMPONENT_POOL, ENTITY_POOL ]);
  });

  it("Parses component class for objects", () => {
    // Arrange
    const input = { x: Component } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ COMPONENT_POOL, ENTITY_POOL ]);
  });

  it("Parses relationship class for arrays", () => {
    // Arrange
    const input = [ Relationship ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ RELATIONSHIP_POOL, ENTITY_POOL, getTargetPoolName(0) ]);
  });

  it("Parses relationship class for objects", () => {
    // Arrange
    const input = { x: Relationship } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ RELATIONSHIP_POOL, ENTITY_POOL, getTargetPoolName(0) ]);
  });

  it("Parses component instance for arrays", () => {
    // Arrange
    const component = new Component<number>();
    const input = [ component ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ getInstancePoolName(component), ENTITY_POOL ]);
  });

  it("Parses component instance for objects", () => {
    // Arrange
    const component = new Component<number>();
    const input = { x: component } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ getInstancePoolName(component), ENTITY_POOL ]);
  });

  it("Parses relationship instance for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const input = [ relationship ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(
      Object.keys(pools),
      [ getInstancePoolName(relationship), ENTITY_POOL, getTargetPoolName(0) ],
    );
  });

  it("Parses relationship instance for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const input = { x: relationship } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(
      Object.keys(pools),
      [ getInstancePoolName(relationship), ENTITY_POOL, getTargetPoolName(0) ],
    );
  });

  it("Parses component instance query with reference source for arrays", () => {
    // Arrange
    const component = new Component<number>();
    const input = [ component.on("a") ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ getInstancePoolName(component), "a" ]);
  });

  it("Parses component instance query with reference source for objects", () => {
    // Arrange
    const component = new Component<number>();
    const input = { x: component.on("a") } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ getInstancePoolName(component), "a" ]);
  });

  it("Parses component instance query with entity source for arrays", () => {
    // Arrange
    const entity = new Entity();
    const component = new Component<number>();
    const input = [ component.on(entity) ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ getInstancePoolName(component), getInstancePoolName(entity) ]);
  });

  it("Parses component instance query with entity source for objects", () => {
    // Arrange
    const entity = new Entity();
    const component = new Component<number>();
    const input = { x: component.on(entity) } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ getInstancePoolName(component), getInstancePoolName(entity) ]);
  });

  it("Parses relationship instance query with reference source for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const input = [ relationship.on("a") ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ getInstancePoolName(relationship), "a", getTargetPoolName(0) ]);
  });

  it("Parses relationship instance query with reference source for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const input = { x: relationship.on("a") } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ getInstancePoolName(relationship), "a", getTargetPoolName(0) ]);
  });

  it("Parses relationship instance query with entity source for arrays", () => {
    // Arrange
    const entity = new Entity();
    const relationship = new Relationship<number>();
    const input = [ relationship.on(entity) ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(
      Object.keys(pools),
      [ getInstancePoolName(relationship), getInstancePoolName(entity), getTargetPoolName(0) ],
    );
  });

  it("Parses relationship instance query with entity source for objects", () => {
    // Arrange
    const entity = new Entity();
    const relationship = new Relationship<number>();
    const input = { x: relationship.on(entity) } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(
      Object.keys(pools),
      [ getInstancePoolName(relationship), getInstancePoolName(entity), getTargetPoolName(0) ],
    );
  });

  it("Parses relationship instance query with reference target for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const input = [ relationship.to("a") ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ getInstancePoolName(relationship), ENTITY_POOL, "a" ]);
  });

  it("Parses relationship instance query with reference target for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const input = { x: relationship.to("a") } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ getInstancePoolName(relationship), ENTITY_POOL, "a" ]);
  });

  it("Parses relationship instance query with entity target for arrays", () => {
    // Arrange
    const entity = new Entity();
    const relationship = new Relationship<number>();
    const input = [ relationship.to(entity) ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(
      Object.keys(pools),
      [ getInstancePoolName(relationship), ENTITY_POOL, getInstancePoolName(entity) ],
    );
  });

  it("Parses relationship instance query with entity target for objects", () => {
    // Arrange
    const entity = new Entity();
    const relationship = new Relationship<number>();
    const input = { x: relationship.to(entity) } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(
      Object.keys(pools),
      [ getInstancePoolName(relationship), ENTITY_POOL, getInstancePoolName(entity) ],
    );
  });

  it("Parses entity wildcard with reference name for arrays", () => {
    // Arrange
    const input = [ Entity.as("a") ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ "a" ]);
  });

  it("Parses entity wildcard with reference name for objects", () => {
    // Arrange
    const input = { x: Entity.as("a") } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ "a" ]);
  });

  it("Parses entity wildcard with once clause for arrays", () => {
    // Arrange
    const input = [ Entity.once() ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ ENTITY_POOL ]);
  });

  it("Parses entity wildcard with once clause for objects", () => {
    // Arrange
    const input = { x: Entity.once() } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ ENTITY_POOL ]);
  });

  it("Parses component wildcard with reference name for arrays", () => {
    // Arrange
    const input = [ Component.as("a") ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ "a", ENTITY_POOL ]);
  });

  it("Parses component wildcard with reference name for objects", () => {
    // Arrange
    const input = { x: Component.as("a") } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ "a", ENTITY_POOL ]);
  });

  it("Parses component wildcard with once clause for arrays", () => {
    // Arrange
    const input = [ Component.once() ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ COMPONENT_POOL, ENTITY_POOL ]);
  });

  it("Parses component wildcard with once clause for objects", () => {
    // Arrange
    const input = { x: Component.once() } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ COMPONENT_POOL, ENTITY_POOL ]);
  });

  it("Parses component wildcard with reference source for arrays", () => {
    // Arrange
    const input = [ Component.on("source") ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ COMPONENT_POOL, "source" ]);
  });

  it("Parses component wildcard with reference source for objects", () => {
    // Arrange
    const input = { x: Component.on("source") } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ COMPONENT_POOL, "source" ]);
  });

  it("Parses component wildcard with entity source for arrays", () => {
    // Arrange
    const entity = new Entity();
    const input = [ Component.on(entity) ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ COMPONENT_POOL, getInstancePoolName(entity) ]);
  });

  it("Parses component wildcard with entity source for objects", () => {
    // Arrange
    const entity = new Entity();
    const input = { x: Component.on(entity) } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ COMPONENT_POOL, getInstancePoolName(entity) ]);
  });

  it("Parses relationship wildcard with reference name for arrays", () => {
    // Arrange
    const input = [ Relationship.as("a") ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ "a", ENTITY_POOL, getTargetPoolName(0) ]);
  });

  it("Parses relationship wildcard with reference name for objects", () => {
    // Arrange
    const input = { x: Relationship.as("a") } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ "a", ENTITY_POOL, getTargetPoolName(0) ]);
  });

  it("Parses relationship wildcard with once clause for arrays", () => {
    // Arrange
    const input = [ Relationship.once() ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ RELATIONSHIP_POOL, ENTITY_POOL, getTargetPoolName(0) ]);
  });

  it("Parses relationship wildcard with once clause for objects", () => {
    // Arrange
    const input = { x: Relationship.once() } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ RELATIONSHIP_POOL, ENTITY_POOL, getTargetPoolName(0) ]);
  });

  it("Parses relationship wildcard with reference source for arrays", () => {
    // Arrange
    const input = [ Relationship.on("source") ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ RELATIONSHIP_POOL, "source", getTargetPoolName(0) ]);
  });

  it("Parses relationship wildcard with reference source for objects", () => {
    // Arrange
    const input = { x: Relationship.on("source") } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ RELATIONSHIP_POOL, "source", getTargetPoolName(0) ]);
  });

  it("Parses relationship wildcard with entity source for arrays", () => {
    // Arrange
    const entity = new Entity();
    const input = [ Relationship.on(entity) ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(
      Object.keys(pools),
      [ RELATIONSHIP_POOL, getInstancePoolName(entity), getTargetPoolName(0) ],
    );
  });

  it("Parses relationship wildcard with entity source for objects", () => {
    // Arrange
    const entity = new Entity();
    const input = { x: Relationship.on(entity) } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(
      Object.keys(pools),
      [ RELATIONSHIP_POOL, getInstancePoolName(entity), getTargetPoolName(0) ],
    );
  });

  it("Parses relationship wildcard with reference target for arrays", () => {
    // Arrange
    const input = [ Relationship.to("target") ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ RELATIONSHIP_POOL, ENTITY_POOL, "target" ]);
  });

  it("Parses relationship wildcard with reference target for objects", () => {
    // Arrange
    const input = { x: Relationship.to("target") } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ RELATIONSHIP_POOL, ENTITY_POOL, "target" ]);
  });

  it("Parses relationship wildcard with entity target for arrays", () => {
    // Arrange
    const entity = new Entity();
    const input = [ Relationship.to(entity) ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ RELATIONSHIP_POOL, ENTITY_POOL, getInstancePoolName(entity) ]);
  });

  it("Parses relationship wildcard with entity target for objects", () => {
    // Arrange
    const entity = new Entity();
    const input = { x: Relationship.to(entity) } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ RELATIONSHIP_POOL, ENTITY_POOL, getInstancePoolName(entity) ]);
  });

  it("Parses component wildcard value query for arrays", () => {
    // Arrange
    const input = [ Component.value() ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ COMPONENT_POOL, ENTITY_POOL ]);
  });

  it("Parses component wildcard value query for objects", () => {
    // Arrange
    const input = { x: Component.value() } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ COMPONENT_POOL, ENTITY_POOL ]);
  });

  it("Parses component wildcard value query with reference name for arrays", () => {
    // Arrange
    const input = [ Component.as("a").value() ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ "a", ENTITY_POOL ]);
  });

  it("Parses component wildcard value query with reference name for objects", () => {
    // Arrange
    const input = { x: Component.as("a").value() } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ "a", ENTITY_POOL ]);
  });

  it("Parses component wildcard value query with once clause for arrays", () => {
    // Arrange
    const input = [ Component.once().value() ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ COMPONENT_POOL, ENTITY_POOL ]);
  });

  it("Parses component wildcard value query with once clause for objects", () => {
    // Arrange
    const input = { x: Component.once().value() } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ COMPONENT_POOL, ENTITY_POOL ]);
  });

  it("Parses component wildcard value query with reference source for arrays", () => {
    // Arrange
    const input = [ Component.on("source").value() ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ COMPONENT_POOL, "source" ]);
  });

  it("Parses component wildcard value query with reference source for objects", () => {
    // Arrange
    const input = { x: Component.on("source").value() } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ COMPONENT_POOL, "source" ]);
  });

  it("Parses component wildcard value query with entity source for arrays", () => {
    // Arrange
    const entity = new Entity();
    const input = [ Component.on(entity).value() ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ COMPONENT_POOL, getInstancePoolName(entity) ]);
  });

  it("Parses component wildcard value query with entity source for objects", () => {
    // Arrange
    const entity = new Entity();
    const input = { x: Component.on(entity).value() } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ COMPONENT_POOL, getInstancePoolName(entity) ]);
  });

  it("Parses relationship wildcard value query with reference name for arrays", () => {
    // Arrange
    const input = [ Relationship.as("a").value() ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ "a", ENTITY_POOL, getTargetPoolName(0) ]);
  });

  it("Parses relationship wildcard value query with reference name for objects", () => {
    // Arrange
    const input = { x: Relationship.as("a").value() } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ "a", ENTITY_POOL, getTargetPoolName(0) ]);
  });

  it("Parses relationship wildcard value query with once clause for arrays", () => {
    // Arrange
    const input = [ Relationship.once().value() ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ RELATIONSHIP_POOL, ENTITY_POOL, getTargetPoolName(0) ]);
  });

  it("Parses relationship wildcard value query with once clause for objects", () => {
    // Arrange
    const input = { x: Relationship.once().value() } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ RELATIONSHIP_POOL, ENTITY_POOL, getTargetPoolName(0) ]);
  });

  it("Parses relationship wildcard value query with reference source for arrays", () => {
    // Arrange
    const input = [ Relationship.on("source").value() ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ RELATIONSHIP_POOL, "source", getTargetPoolName(0) ]);
  });

  it("Parses relationship wildcard value query with reference source for objects", () => {
    // Arrange
    const input = { x: Relationship.on("source").value() } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ RELATIONSHIP_POOL, "source", getTargetPoolName(0) ]);
  });

  it("Parses relationship wildcard value query with reference target for arrays", () => {
    // Arrange
    const input = [ Relationship.to("target").value() ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ RELATIONSHIP_POOL, ENTITY_POOL, "target" ]);
  });

  it("Parses relationship wildcard value query with reference target for objects", () => {
    // Arrange
    const input = { x: Relationship.to("target").value() } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ RELATIONSHIP_POOL, ENTITY_POOL, "target" ]);
  });

  it("Parses relationship wildcard value query with entity source for arrays", () => {
    // Arrange
    const entity = new Entity();
    const input = [ Relationship.on(entity).value() ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(
      Object.keys(pools),
      [ RELATIONSHIP_POOL, getInstancePoolName(entity), getTargetPoolName(0) ],
    );
  });

  it("Parses relationship wildcard value query with entity source for objects", () => {
    // Arrange
    const entity = new Entity();
    const input = { x: Relationship.on(entity).value() } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(
      Object.keys(pools),
      [ RELATIONSHIP_POOL, getInstancePoolName(entity), getTargetPoolName(0) ],
    );
  });

  it("Parses relationship wildcard value query with entity target for arrays", () => {
    // Arrange
    const entity = new Entity();
    const input = [ Relationship.to(entity).value() ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ RELATIONSHIP_POOL, ENTITY_POOL, getInstancePoolName(entity) ]);
  });

  it("Parses relationship wildcard value query with entity target for objects", () => {
    // Arrange
    const entity = new Entity();
    const input = { x: Relationship.to(entity).value() } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ RELATIONSHIP_POOL, ENTITY_POOL, getInstancePoolName(entity) ]);
  });
});

describe(parseConstraints.name, () => {
  it("Parses entity class for arrays", () => {
    // Arrange
    const input = [ Entity ] as const;
    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [],
      },
      crossPool: [],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses entity class for objects", () => {
    // Arrange
    const input = { x: Entity } as const;
    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [],
      },
      crossPool: [],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component class for arrays", () => {
    // Arrange
    const input = [ Component ] as const;
    const expected: Constraints = {
      poolSpecific: {
        [COMPONENT_POOL]: [ isA(Component) ],
        [ENTITY_POOL]: [],
      },
      crossPool: [
        poolHasPool(ENTITY_POOL, COMPONENT_POOL),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component class for objects", () => {
    // Arrange
    const input = { x: Component } as const;
    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [],
        [COMPONENT_POOL]: [ isA(Component) ],
      },
      crossPool: [
        poolHasPool(ENTITY_POOL, COMPONENT_POOL),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship class for arrays", () => {
    // Arrange
    const input = [ Relationship ] as const;
    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [],
        [RELATIONSHIP_POOL]: [ isA(Relationship) ],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        poolTargetsPool(ENTITY_POOL, RELATIONSHIP_POOL, getTargetPoolName(0)),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship class for objects", () => {
    // Arrange
    const input = { x: Relationship } as const;
    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [],
        [RELATIONSHIP_POOL]: [ isA(Relationship) ],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        poolTargetsPool(ENTITY_POOL, RELATIONSHIP_POOL, getTargetPoolName(0)),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component instance for arrays", () => {
    // Arrange
    const component = new Component<number>();
    const input = [ component ] as const;
    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [ has(component) ],
        [COMPONENT_POOL]: [ is(component) ],
      },
      crossPool: [],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component instance for objects", () => {
    // Arrange
    const component = new Component<number>();
    const input = { x: component } as const;
    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [ has(component) ],
        [COMPONENT_POOL]: [ is(component) ],
      },
      crossPool: [],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship instance for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const input = [ relationship ] as const;
    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [ has(relationship) ],
        [RELATIONSHIP_POOL]: [ is(relationship) ],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        poolTargetsPool(ENTITY_POOL, RELATIONSHIP_POOL, getTargetPoolName(0)),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship instance for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const input = { x: relationship } as const;
    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [ has(relationship) ],
        [RELATIONSHIP_POOL]: [ is(relationship) ],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        poolTargetsPool(ENTITY_POOL, RELATIONSHIP_POOL, getTargetPoolName(0)),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component instance query with reference source for arrays", () => {
    // Arrange
    const component = new Component<number>();
    const input = [ component.on("source") ] as const;
    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [ has(component) ],
        [COMPONENT_POOL]: [ isA(Component) ],
      },
      crossPool: [
        poolHasPool("source", COMPONENT_POOL),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component instance query with reference source for objects", () => {
    // Arrange
    const component = new Component<number>();
    const input = { x: component.on("source") } as const;
    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [ has(component) ],
        [COMPONENT_POOL]: [ isA(Component) ],
      },
      crossPool: [
        poolHasPool("source", COMPONENT_POOL),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component instance query with entity source for arrays", () => {
    // Arrange
    const entity = new Entity();
    const component = new Component<number>();
    const input = [ component.on(entity) ] as const;
    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [ is(entity), has(component) ],
        [COMPONENT_POOL]: [ is(component) ],
      },
      crossPool: [
        poolHasPool(ENTITY_POOL, COMPONENT_POOL),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component instance query with entity source for objects", () => {
    // Arrange
    const entity = new Entity();
    const component = new Component<number>();
    const input = { x: component.on(entity) } as const;
    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [ is(entity), has(component) ],
        [COMPONENT_POOL]: [ is(component) ],
      },
      crossPool: [
        poolHasPool(ENTITY_POOL, COMPONENT_POOL),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship instance query with reference source for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const input = [ relationship.on("source") ] as const;
    const expected: Constraints = {
      poolSpecific: {
        ["source"]: [ has(relationship) ],
        [RELATIONSHIP_POOL]: [ isA(Relationship) ],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        poolTargetsPool("source", RELATIONSHIP_POOL, getTargetPoolName(0)),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship instance query with reference source for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const input = { x: relationship.on("source") } as const;
    const expected: Constraints = {
      poolSpecific: {
        ["source"]: [ has(relationship) ],
        [RELATIONSHIP_POOL]: [ isA(Relationship) ],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        poolTargetsPool("source", RELATIONSHIP_POOL, getTargetPoolName(0)),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship instance query with reference target for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const input = [ relationship.to("target") ] as const;
    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [ has(relationship) ],
        [RELATIONSHIP_POOL]: [ isA(Relationship) ],
        ["target"]: [],
      },
      crossPool: [
        poolTargetsPool(ENTITY_POOL, RELATIONSHIP_POOL, "target"),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship instance query with reference target for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const input = { x: relationship.to("target") } as const;
    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [ has(relationship) ],
        [RELATIONSHIP_POOL]: [ isA(Relationship) ],
        ["target"]: [],
      },
      crossPool: [
        poolTargetsPool(ENTITY_POOL, RELATIONSHIP_POOL, "target"),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship instance query with entity source for arrays", () => {
    // Arrange
    const entity = new Entity();
    const relationship = new Relationship<number>();
    const input = [ relationship.on(entity) ] as const;
    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [ is(entity), has(relationship) ],
        [RELATIONSHIP_POOL]: [ is(relationship) ],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        poolTargetsPool(ENTITY_POOL, RELATIONSHIP_POOL, getTargetPoolName(0)),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship instance query with entity source for objects", () => {
    // Arrange
    const entity = new Entity();
    const relationship = new Relationship<number>();
    const input = { x: relationship.on(entity) } as const;
    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [ is(entity), has(relationship) ],
        [RELATIONSHIP_POOL]: [ is(relationship) ],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        poolTargetsPool(ENTITY_POOL, RELATIONSHIP_POOL, getTargetPoolName(0)),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship instance query with entity target for arrays", () => {
    // Arrange
    const entity = new Entity();
    const relationship = new Relationship<number>();
    const input = [ relationship.to(entity) ] as const;
    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [ has(relationship) ],
        [RELATIONSHIP_POOL]: [ is(relationship) ],
        [getTargetPoolName(0)]: [ is(entity) ],
      },
      crossPool: [
        poolTargetsPool(ENTITY_POOL, RELATIONSHIP_POOL, getTargetPoolName(0)),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship instance query with entity target for objects", () => {
    // Arrange
    const entity = new Entity();
    const relationship = new Relationship<number>();
    const input = { x: relationship.to(entity) } as const;
    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [ has(relationship) ],
        [RELATIONSHIP_POOL]: [ is(relationship) ],
        [getTargetPoolName(0)]: [ is(entity) ],
      },
      crossPool: [
        poolTargetsPool(ENTITY_POOL, RELATIONSHIP_POOL, getTargetPoolName(0)),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses entity wildcard with reference name for arrays", () => {
    // Arrange
    const input = [ Entity.as("a") ] as const;
    const expected: Constraints = {
      poolSpecific: {
        ["a"]: [],
      },
      crossPool: [],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses entity wildcard with reference name for objects", () => {
    // Arrange
    const input = { x: Entity.as("a") } as const;
    const expected: Constraints = {
      poolSpecific: {
        ["a"]: [],
      },
      crossPool: [],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses entity wildcard with once clause for arrays", () => {
    // TODO
  });

  it("Parses entity wildcard with once clause for objects", () => {
    // TODO
  });

  it("Parses component wildcard with reference name for arrays", () => {
    // Arrange
    const input = [ Component.as("a") ] as const;
    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [],
        ["a"]: [ isA(Component) ],
      },
      crossPool: [
        poolHasPool(ENTITY_POOL, "a"),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component wildcard with reference name for objects", () => {
    // Arrange
    const input = { x: Component.as("a") } as const;
    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [],
        ["a"]: [ isA(Component) ],
      },
      crossPool: [
        poolHasPool(ENTITY_POOL, "a"),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component wildcard with once clause for arrays", () => {
    // TODO
  });

  it("Parses component wildcard with once clause for objects", () => {
    // TODO
  });

  it("Parses component wildcard with reference source for arrays", () => {
    // Arrange
    const input = [ Component.on("source") ] as const;
    const expected: Constraints = {
      poolSpecific: {
        "source": [],
        [COMPONENT_POOL]: [ isA(Component) ],
      },
      crossPool: [
        poolHasPool("source", COMPONENT_POOL),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component wildcard with reference source for objects", () => {
    // Arrange
    const input = { x: Component.on("source") } as const;
    const expected: Constraints = {
      poolSpecific: {
        "source": [],
        [COMPONENT_POOL]: [ isA(Component) ],
      },
      crossPool: [
        poolHasPool("source", COMPONENT_POOL),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component wildcard with entity source for arrays", () => {
    // Arrange
    const entity = new Entity();
    const input = [ Component.on(entity) ] as const;
    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [ is(entity) ],
        [COMPONENT_POOL]: [ isA(Component) ],
      },
      crossPool: [
        poolHasPool(ENTITY_POOL, COMPONENT_POOL),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component wildcard with entity source for objects", () => {
    // Arrange
    const entity = new Entity();
    const input = { x: Component.on(entity) } as const;
    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [ is(entity) ],
        [COMPONENT_POOL]: [ isA(Component) ],
      },
      crossPool: [
        poolHasPool(ENTITY_POOL, COMPONENT_POOL),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard with reference name for arrays", () => {
    // Arrange
    const input = [ Relationship.as("a") ] as const;
    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [],
        ["a"]: [ isA(Relationship) ],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        poolTargetsPool(ENTITY_POOL, "a", getTargetPoolName(0)),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard with reference name for objects", () => {
    // Arrange
    const input = { x: Relationship.as("a") } as const;
    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [],
        ["a"]: [ isA(Relationship) ],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        poolTargetsPool(ENTITY_POOL, "a", getTargetPoolName(0)),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard with once clause for arrays", () => {
    // TODO
  });

  it("Parses relationship wildcard with once clause for objects", () => {
    // TODO
  });

  it("Parses relationship wildcard with reference source for arrays", () => {
    // Arrange
    const input = [ Relationship.on("source") ] as const;
    const expected: Constraints = {
      poolSpecific: {
        ["source"]: [],
        [RELATIONSHIP_POOL]: [ isA(Relationship) ],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        poolTargetsPool("source", RELATIONSHIP_POOL, getTargetPoolName(0)),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard with reference source for objects", () => {
    // Arrange
    const input = { x: Relationship.on("source") } as const;
    const expected: Constraints = {
      poolSpecific: {
        ["source"]: [],
        [RELATIONSHIP_POOL]: [ isA(Relationship) ],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        poolTargetsPool("source", RELATIONSHIP_POOL, getTargetPoolName(0)),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard with reference target for arrays", () => {
    // Arrange
    const input = [ Relationship.to("target") ] as const;
    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [],
        [RELATIONSHIP_POOL]: [ isA(Relationship) ],
        ["target"]: [],
      },
      crossPool: [
        poolTargetsPool(ENTITY_POOL, RELATIONSHIP_POOL, "target"),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard with reference target for objects", () => {
    // Arrange
    const input = { x: Relationship.to("target") } as const;
    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [],
        [RELATIONSHIP_POOL]: [ isA(Relationship) ],
        ["target"]: [],
      },
      crossPool: [
        poolTargetsPool(ENTITY_POOL, RELATIONSHIP_POOL, "target"),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard with entity source for arrays", () => {
    // Arrange
    const entity = new Entity();
    const input = [ Relationship.on(entity) ] as const;
    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [ is(entity) ],
        [RELATIONSHIP_POOL]: [ isA(Relationship) ],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        poolTargetsPool(ENTITY_POOL, RELATIONSHIP_POOL, getTargetPoolName(0)),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard with entity source for objects", () => {
    // Arrange
    const entity = new Entity();
    const input = { x: Relationship.on(entity) } as const;
    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [ is(entity) ],
        [RELATIONSHIP_POOL]: [ isA(Relationship) ],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        poolTargetsPool(ENTITY_POOL, RELATIONSHIP_POOL, getTargetPoolName(0)),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard with entity target for arrays", () => {
    // Arrange
    const entity = new Entity();
    const input = [ Relationship.to(entity) ] as const;
    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [],
        [RELATIONSHIP_POOL]: [ isA(Relationship) ],
        [getTargetPoolName(0)]: [ is(entity) ],
      },
      crossPool: [
        poolTargetsPool(ENTITY_POOL, RELATIONSHIP_POOL, getTargetPoolName(0)),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard with entity target for objects", () => {
    // Arrange
    const entity = new Entity();
    const input = { x: Relationship.to(entity) } as const;
    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [],
        [RELATIONSHIP_POOL]: [ isA(Relationship) ],
        [getTargetPoolName(0)]: [ is(entity) ],
      },
      crossPool: [
        poolTargetsPool(ENTITY_POOL, RELATIONSHIP_POOL, getTargetPoolName(0)),
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });
});

describe(parseMappers.name, () => {
  it("Parses entity class for arrays", () => {
    // Arrange
    const entity = new Entity();
    const permutation = {
      [ENTITY_POOL]: entity,
    };
    const input = [ Entity ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ entity ]);
  });

  it("Parses entity class for objects", () => {
    // Arrange
    const entity = new Entity();
    const permutation = {
      [ENTITY_POOL]: entity,
    };
    const input = { x: Entity } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: entity });
  });

  it("Parses component class for arrays", () => {
    // Arrange
    const component = new Component<number>();
    const entity = new Entity();
    const value = 1;
    entity.add(component.withValue(value));
    const permutation = {
      [COMPONENT_POOL]: component,
      [ENTITY_POOL]: entity,
    };
    const input = [ Component ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ component ]);
  });

  it("Parses component class for objects", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      [COMPONENT_POOL]: component,
      [ENTITY_POOL]: entity,
    };
    const input = { x: Component } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: component });
  });

  it("Parses relationship class for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [RELATIONSHIP_POOL]: relationship,
      [ENTITY_POOL]: entity1,
      [getTargetPoolName(0)]: entity2,
    };
    const input = [ Relationship ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ relationship ]);
  });

  it("Parses relationship class for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [RELATIONSHIP_POOL]: relationship,
      [ENTITY_POOL]: entity1,
      [getTargetPoolName(0)]: entity2,
    };
    const input = { x: Relationship } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: relationship });
  });

  it("Parses component instance for arrays", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      [getInstancePoolName(component)]: component,
      [ENTITY_POOL]: entity,
    };
    const input = [ component ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ value ]);
  });

  it("Parses component instance for objects", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      [getInstancePoolName(component)]: component,
      [ENTITY_POOL]: entity,
    };
    const input = { x: component } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: value });
  });

  it("Parses relationship instance for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity = new Entity();
    entity.add(relationship.to(relationship).withValue(value));
    const permutation = {
      [getInstancePoolName(relationship)]: entity,
      [RELATIONSHIP_POOL]: relationship,
      [getTargetPoolName(0)]: relationship,
    };
    const input = [ relationship ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ value ]);
  });

  it("Parses relationship instance for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity = new Entity();
    entity.add(relationship.to(relationship).withValue(value));
    const permutation = {
      [getInstancePoolName(relationship)]: entity,
      [RELATIONSHIP_POOL]: relationship,
      [getTargetPoolName(0)]: relationship,
    };
    const input = { x: relationship } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: value });
  });

  it("Parses component instance query with reference source for arrays", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      [getInstancePoolName(component)]: component,
      "source": entity,
    };
    const input = [ component.on("source") ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ value ]);
  });

  it("Parses component instance query with reference source for objects", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      [getInstancePoolName(component)]: component,
      "source": entity,
    };
    const input = { x: component.on("source") } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: value });
  });

  it("Parses component instance query with entity source for arrays", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      [getInstancePoolName(component)]: component,
      [getInstancePoolName(entity)]: entity,
    };
    const input = [ component.on(entity) ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ value ]);
  });

  it("Parses component instance query with entity source for objects", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      [getInstancePoolName(component)]: component,
      [getInstancePoolName(entity)]: entity,
    };
    const input = { x: component.on(entity) } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: value });
  });

  it("Parses relationship instance query with reference source for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [getInstancePoolName(relationship)]: relationship,
      ["source"]: entity1,
      [getTargetPoolName(0)]: entity2,
    };
    const input = [ relationship.on("source") ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ value ]);
  });

  it("Parses relationship instance query with reference source for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [getInstancePoolName(relationship)]: relationship,
      ["source"]: entity1,
      [getTargetPoolName(0)]: entity2,
    };
    const input = { x: relationship.on("source") } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: value });
  });

  it("Parses relationship instance query with entity source for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [getInstancePoolName(relationship)]: relationship,
      [getInstancePoolName(entity1)]: entity1,
      [getTargetPoolName(0)]: entity2,
    };
    const input = [ relationship.on(entity1) ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ value ]);
  });

  it("Parses relationship instance query with entity source for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [getInstancePoolName(relationship)]: relationship,
      [getInstancePoolName(entity1)]: entity1,
      [getTargetPoolName(0)]: entity2,
    };
    const input = { x: relationship.on(entity1) } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: value });
  });

  it("Parses relationship instance query with reference target for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [getInstancePoolName(relationship)]: relationship,
      [ENTITY_POOL]: entity1,
      "target": entity2,
    };
    const input = [ relationship.to("target") ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ value ]);
  });

  it("Parses relationship instance query with reference target for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [getInstancePoolName(relationship)]: relationship,
      [ENTITY_POOL]: entity1,
      "target": entity2,
    };
    const input = { x: relationship.to("target") } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: value });
  });

  it("Parses relationship instance query with entity target for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [getInstancePoolName(relationship)]: relationship,
      [ENTITY_POOL]: entity1,
      [getInstancePoolName(entity2)]: entity2,
    };
    const input = [ relationship.to(entity2) ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ value ]);
  });

  it("Parses relationship instance query with entity target for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [getInstancePoolName(relationship)]: relationship,
      [ENTITY_POOL]: entity1,
      [getInstancePoolName(entity2)]: entity2,
    };
    const input = { x: relationship.to(entity2) } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: value });
  });

  it("Parses entity wildcard with reference name for arrays", () => {
    // Arrange
    const entity = new Entity();
    const permutation = {
      "a": entity,
    };
    const input = [ Entity.as("a") ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ entity ]);
  });

  it("Parses entity wildcard with reference name for objects", () => {
    // Arrange
    const entity = new Entity();
    const permutation = {
      "a": entity,
    };
    const input = { x: Entity.as("a") } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: entity });
  });

  it("Parses entity wildcard with once clause for arrays", () => {
    // Arrange
    const entity = new Entity();
    const permutation = {
      [ENTITY_POOL]: entity,
    };
    const input = [ Entity.once() ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ entity ]);
  });

  it("Parses entity wildcard with once clause for objects", () => {
    // Arrange
    const entity = new Entity();
    const permutation = {
      [ENTITY_POOL]: entity,
    };
    const input = { x: Entity.once() } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: entity });
  });

  it("Parses component wildcard with reference name for arrays", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      "a": component,
      [ENTITY_POOL]: entity,
    };
    const input = [ Component.as("a") ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ component ]);
  });

  it("Parses component wildcard with reference name for objects", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      "a": component,
      [ENTITY_POOL]: entity,
    };
    const input = { x: Component.as("a") } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: component });
  });

  it("Parses component wildcard with once clause for arrays", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      [COMPONENT_POOL]: component,
      [ENTITY_POOL]: entity,
    };
    const input = [ Component.once() ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ component ]);
  });

  it("Parses component wildcard with once clause for objects", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      [COMPONENT_POOL]: component,
      [ENTITY_POOL]: entity,
    };
    const input = { x: Component.once() } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: component });
  });

  it("Parses component wildcard with reference source for arrays", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      [COMPONENT_POOL]: component,
      "source": entity,
    };
    const input = [ Component.on("source") ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ component ]);
  });

  it("Parses component wildcard with reference source for objects", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      [COMPONENT_POOL]: component,
      "source": entity,
    };
    const input = { x: Component.on("source") } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: component });
  });

  it("Parses component wildcard with entity source for arrays", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      [COMPONENT_POOL]: component,
      [getInstancePoolName(entity)]: entity,
    };
    const input = [ Component.on(entity) ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ component ]);
  });

  it("Parses component wildcard with entity source for objects", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      [COMPONENT_POOL]: component,
      [getInstancePoolName(entity)]: entity,
    };
    const input = { x: Component.on(entity) } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: component });
  });

  it("Parses relationship wildcard with reference name for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      "a": relationship,
      [ENTITY_POOL]: entity1,
      [getTargetPoolName(0)]: entity2,
    };
    const input = [ Relationship.as("a") ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ relationship ]);
  });

  it("Parses relationship wildcard with reference name for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      "a": relationship,
      [ENTITY_POOL]: entity1,
      [getTargetPoolName(0)]: entity2,
    };
    const input = { x: Relationship.as("a") } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: relationship });
  });

  it("Parses relationship wildcard with once clause for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [RELATIONSHIP_POOL]: relationship,
      [ENTITY_POOL]: entity1,
      [getTargetPoolName(0)]: entity2,
    };
    const input = [ Relationship.once() ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ relationship ]);
  });

  it("Parses relationship wildcard with once clause for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [RELATIONSHIP_POOL]: relationship,
      [ENTITY_POOL]: entity1,
      [getTargetPoolName(0)]: entity2,
    };
    const input = { x: Relationship.once() } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: relationship });
  });

  it("Parses relationship wildcard with reference source for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [RELATIONSHIP_POOL]: relationship,
      "source": entity1,
      [getTargetPoolName(0)]: entity2,
    };
    const input = [ Relationship.on("source") ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ relationship ]);
  });

  it("Parses relationship wildcard with reference source for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [RELATIONSHIP_POOL]: relationship,
      "source": entity1,
      [getTargetPoolName(0)]: entity2,
    };
    const input = { x: Relationship.on("source") } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: relationship });
  });

  it("Parses relationship wildcard with entity source for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [RELATIONSHIP_POOL]: relationship,
      [getInstancePoolName(entity1)]: entity1,
      [getTargetPoolName(0)]: entity2,
    };
    const input = [ Relationship.on(entity1) ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ relationship ]);
  });

  it("Parses relationship wildcard with entity source for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [RELATIONSHIP_POOL]: relationship,
      [getInstancePoolName(entity1)]: entity1,
      [getTargetPoolName(0)]: entity2,
    };
    const input = { x: Relationship.on(entity1) } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: relationship });
  });

  it("Parses relationship wildcard with reference target for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [RELATIONSHIP_POOL]: relationship,
      [ENTITY_POOL]: entity1,
      ["target"]: entity2,
    };
    const input = [ Relationship.to("target") ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ relationship ]);
  });

  it("Parses relationship wildcard with reference target for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [RELATIONSHIP_POOL]: relationship,
      [ENTITY_POOL]: entity1,
      ["target"]: entity2,
    };
    const input = { x: Relationship.to("target") } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: relationship });
  });

  it("Parses relationship wildcard with entity target for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [RELATIONSHIP_POOL]: relationship,
      [ENTITY_POOL]: entity1,
      [getTargetPoolName(0)]: entity2,
    };
    const input = [ Relationship.to(entity2) ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ relationship ]);
  });

  it("Parses relationship wildcard with entity target for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [RELATIONSHIP_POOL]: relationship,
      [ENTITY_POOL]: entity1,
      [getTargetPoolName(0)]: entity2,
    };
    const input = { x: Relationship.to(entity2) } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: relationship });
  });

  it("Parses component wildcard value query for arrays", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      [COMPONENT_POOL]: component,
      [ENTITY_POOL]: entity,
    };
    const input = [ Component.value() ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    const result = mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(result, value);
  });

  it("Parses component wildcard value query for objects", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      [COMPONENT_POOL]: component,
      [ENTITY_POOL]: entity,
    };
    const input = { x: Component.value() } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    const result = mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(result, value);
  });

  it("Parses component wildcard value query with reference name for arrays", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      "a": component,
      [ENTITY_POOL]: entity,
    };
    const input = [ Component.as("a").value() ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    const result = mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(result, value);
  });

  it("Parses component wildcard value query with reference name for objects", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      "a": component,
      [ENTITY_POOL]: entity,
    };
    const input = { x: Component.as("a").value() } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    const result = mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(result, value);
  });

  it("Parses component wildcard value query with once clause for arrays", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      [COMPONENT_POOL]: component,
      [ENTITY_POOL]: entity,
    };
    const input = [ Component.once().value() ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    const result = mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(result, value);
  });

  it("Parses component wildcard value query with once clause for objects", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      [COMPONENT_POOL]: component,
      [ENTITY_POOL]: entity,
    };
    const input = { x: Component.once().value() } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    const result = mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(result, value);
  });

  it("Parses component wildcard value query with reference source for arrays", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      [COMPONENT_POOL]: component,
      "source": entity,
    };
    const input = [ Component.on("source").value() ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    const result = mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(result, value);
  });

  it("Parses component wildcard value query with reference source for objects", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      [COMPONENT_POOL]: component,
      "source": entity,
    };
    const input = { x: Component.on("source").value() } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    const result = mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(result, value);
  });

  it("Parses component wildcard value query with entity source for arrays", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      [COMPONENT_POOL]: component,
      [getInstancePoolName(entity)]: entity,
    };
    const input = [ Component.on(entity).value() ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    const result = mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(result, value);
  });

  it("Parses component wildcard value query with entity source for objects", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      [COMPONENT_POOL]: component,
      [getInstancePoolName(entity)]: entity,
    };
    const input = { x: Component.on(entity).value() } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    const result = mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(result, value);
  });

  it("Parses relationship wildcard value query with reference name for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      "a": relationship,
      [ENTITY_POOL]: entity1,
      [getTargetPoolName(0)]: entity2,
    };
    const input = [ Relationship.as("a").value() ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    const result = mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(result, value);
  });

  it("Parses relationship wildcard value query with reference name for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      "a": relationship,
      [ENTITY_POOL]: entity1,
      [getTargetPoolName(0)]: entity2,
    };
    const input = { x: Relationship.as("a").value() } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    const result = mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(result, value);
  });

  it("Parses relationship wildcard value query with once clause for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [RELATIONSHIP_POOL]: relationship,
      [ENTITY_POOL]: entity1,
      [getTargetPoolName(0)]: entity2,
    };
    const input = [ Relationship.once().value() ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    const result = mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(result, value);
  });

  it("Parses relationship wildcard value query with once clause for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [RELATIONSHIP_POOL]: relationship,
      [ENTITY_POOL]: entity1,
      [getTargetPoolName(0)]: entity2,
    };
    const input = { x: Relationship.once().value() } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    const result = mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(result, value);
  });

  it("Parses relationship wildcard value query with reference source for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [RELATIONSHIP_POOL]: relationship,
      "source": entity1,
      [getTargetPoolName(0)]: entity2,
    };
    const input = [ Relationship.on("source").value() ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    const result = mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(result, value);
  });

  it("Parses relationship wildcard value query with reference source for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [RELATIONSHIP_POOL]: relationship,
      "source": entity1,
      [getTargetPoolName(0)]: entity2,
    };
    const input = { x: Relationship.on("source").value() } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    const result = mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(result, value);
  });

  it("Parses relationship wildcard value query with entity source for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [RELATIONSHIP_POOL]: relationship,
      [getInstancePoolName(entity1)]: entity1,
      [getTargetPoolName(0)]: entity2,
    };
    const input = [ Relationship.on(entity1).value() ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    const result = mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(result, value);
  });

  it("Parses relationship wildcard value query with entity source for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [RELATIONSHIP_POOL]: relationship,
      [getInstancePoolName(entity1)]: entity1,
      [getTargetPoolName(0)]: entity2,
    };
    const input = { x: Relationship.on(entity1).value() } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    const result = mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(result, value);
  });

  it("Parses relationship wildcard value query with reference target for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [RELATIONSHIP_POOL]: relationship,
      [ENTITY_POOL]: entity1,
      ["target"]: entity2,
    };
    const input = [ Relationship.to("target").value() ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    const result = mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(result, value);
  });

  it("Parses relationship wildcard value query with reference target for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [RELATIONSHIP_POOL]: relationship,
      [ENTITY_POOL]: entity1,
      ["target"]: entity2,
    };
    const input = { x: Relationship.to("target").value() } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    const result = mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(result, value);
  });

  it("Parses relationship wildcard value query with entity target for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [RELATIONSHIP_POOL]: relationship,
      [ENTITY_POOL]: entity1,
      [getTargetPoolName(0)]: entity2,
    };
    const input = [ Relationship.to(entity2).value() ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    const result = mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(result, value);
  });

  it("Parses relationship wildcard value query with entity target for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [RELATIONSHIP_POOL]: relationship,
      [ENTITY_POOL]: entity1,
      [getTargetPoolName(0)]: entity2,
    };
    const input = { x: Relationship.to(entity2).value() } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    const result = mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(result, value);
  });
});

describe(combineMappers.name, () => {
  it("Combine mappers for object", () => {
    // Arrange
    const input = {
      a: Entity.as("c"),
      b: Entity.as("d"),
    } as const;

    const mappers: PermutationMapper<typeof input>[] = [
      (permutation, output) => {
        output.a = permutation.a;
      },
      (permutation, output) => {
        output.b = permutation.b;
      },
    ];

    // Act
    const mapper = combineMappers(input, mappers);
    const output = mapper({
      c: new Entity("Entity 1"),
      d: new Entity("Entity 2"),
    });

    // Assert
    assert.deepStrictEqual(output, { a: "Entity 1", b: "Entity 2" });
  });

  it("Combine mappers for array", () => {
    // Arrange
    const input = [
      Entity.as("a"),
      Entity.as("b"),
    ] as const;

    const mappers: PermutationMapper<typeof input>[] = [
      (permutation, output) => {
        output.push(permutation.a);
      },
      (permutation, output) => {
        output.push(permutation.b);
      },
    ];

    // Act
    const mapper = combineMappers(input, mappers);
    const output = mapper({
      a: new Entity("Entity 1"),
      b: new Entity("Entity 2"),
    });

    // Assert
    assert.deepStrictEqual(output, [ "Entity 1", "Entity 2" ]);
  });
});

describe(permutePools.name, () => {
  it("Permute pools", () => {
    // Arrange
    const pools: Pools = {
      a: () => createEntityGenerator(2, "Entity A"),
      b: () => createEntityGenerator(2, "Entity B"),
    };

    // Act
    const result = permutePools(pools);

    // Assert
    assert.deepStrictEqual(
      [ ...result ],
      [
        { a: new Entity("Entity A 0"), b: new Entity("Entity B 0") },
        { a: new Entity("Entity A 0"), b: new Entity("Entity B 1") },
        { a: new Entity("Entity A 1"), b: new Entity("Entity B 0") },
        { a: new Entity("Entity A 1"), b: new Entity("Entity B 1") },
      ],
    );
  });

  it("Should do nothing with empty pools", () => {
    // Arrange
    const pools: Pools = {};

    // Act
    const result = permutePools(pools);

    // Assert
    assert.deepStrictEqual(
      [ ...result ],
      [],
    );
  });
});

describe(filterPools.name, () => {
  it("Filter pools", () => {
    // Arrange
    const pools: Pools = {
      a: () => createEntityGenerator(2),
      b: () => createEntityGenerator(3),
    };

    const constraints: Record<string, EntityConstraint[]> = {
      a: [ (entity) => entity.name !== "Entity 0" ],
      b: [ (entity) => entity.name !== "Entity 1" ],
    };

    // Act
    const result = filterPools(pools, constraints);

    // Assert
    assert.deepStrictEqual(
      [ ...result.a() ],
      [ new Entity("Entity 1") ],
    );
    assert.deepStrictEqual(
      [ ...result.b() ],
      [ new Entity("Entity 0"), new Entity("Entity 2") ],
    );
  });

  it("Should do nothing with empty pools", () => {
    // Arrange
    const pools: Pools = {};

    const constraints: Record<string, EntityConstraint[]> = {};

    // Act
    const result = filterPools(pools, constraints);

    // Assert
    assert.deepStrictEqual(
      Object.keys(result),
      [],
    );
  });
});

describe(filterGenerator.name, () => {
  it("Should filter generator", () => {
    // Arrange
    const generator = function* () {
      yield 1;
      yield 2;
      yield 3;
    }();

    // Act
    const result = filterGenerator(generator, (value) => value > 1);

    // Assert
    assert.deepStrictEqual([ ...result ], [ 2, 3 ]);
  });

  it("Should do nothing with empty generator", () => {
    // Arrange
    const generator = function* () {
    }();

    // Act
    const result = filterGenerator(generator, (value) => value > 1);

    // Assert
    assert.deepStrictEqual([ ...result ], []);
  });
});

function createEntityGenerator(count: number, prefix?: string): Generator<Entity> {
  return function* () {
    for (let i = 0; i < count; i++) {
      yield new Entity(`${ prefix ?? "Entity" } ${ i }`);
    }
  }();
}
