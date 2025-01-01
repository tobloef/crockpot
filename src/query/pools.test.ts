import {
  describe,
  it,
} from "node:test";
import * as assert from "node:assert";
import {
  arrayToGenerator,
  combineMappers,
  COMPONENT_POOL,
  constraintFunctions,
  type Constraints,
  ENTITY_POOL,
  type EntityConstraint,
  filterGenerator,
  filterPools,
  getInstancePoolName,
  getTargetPoolName,
  parseConstraints,
  parseMappers,
  parsePoolInfos,
  type PermutationMapper,
  permutePools,
  type Pools,
  RELATIONSHIP_POOL,
} from "./pools.ts";
import { Entity } from "../entity/index.ts";
import type { QueryOutputItem } from "./output.ts";
import { Component } from "../component/index.ts";
import { Relationship } from "../relationship/index.ts";

describe("parsePoolInfos", () => {
  it("Parses entity class for arrays", () => {
    // Arrange
    const input = [ Entity ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [ENTITY_POOL]: { isOnce: false }
    });
  });

  it("Parses entity class for objects", () => {
    // Arrange
    const input = { x: Entity } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [ENTITY_POOL]: { isOnce: false }
    });
  });

  it("Parses component class for arrays", () => {
    // Arrange
    const input = [ Component ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [COMPONENT_POOL]: { isOnce: false },
    });
  });

  it("Parses component class for objects", () => {
    // Arrange
    const input = { x: Component } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [COMPONENT_POOL]: { isOnce: false },
    });
  });

  it("Parses relationship class for arrays", () => {
    // Arrange
    const input = [ Relationship ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [RELATIONSHIP_POOL]: { isOnce: false },
    });
  });

  it("Parses relationship class for objects", () => {
    // Arrange
    const input = { x: Relationship } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [RELATIONSHIP_POOL]: { isOnce: false },
    });
  });

  it("Parses component instance for arrays", () => {
    // Arrange
    const component = new Component<number>();
    const input = [ component ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [ENTITY_POOL]: { isOnce: false }
    });
  });

  it("Parses component instance for objects", () => {
    // Arrange
    const component = new Component<number>();
    const input = { x: component } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [ENTITY_POOL]: { isOnce: false }
    });
  });

  it("Parses relationship instance for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const input = [ relationship ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [getInstancePoolName(relationship)]: { isOnce: false },
      [ENTITY_POOL]: { isOnce: false },
      [getTargetPoolName(0)]: { isOnce: false }
    });
  });

  it("Parses relationship instance for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const input = { x: relationship } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [getInstancePoolName(relationship)]: { isOnce: false },
      [ENTITY_POOL]: { isOnce: false },
      [getTargetPoolName(0)]: { isOnce: false }
    });
  });

  it("Parses component instance query with reference source for arrays", () => {
    // Arrange
    const component = new Component<number>();
    const input = [ component.on("a") ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      "a": { isOnce: false }
    });
  });

  it("Parses component instance query with reference source for objects", () => {
    // Arrange
    const component = new Component<number>();
    const input = { x: component.on("a") } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      "a": { isOnce: false }
    });
  });

  it("Parses component instance query with entity source for arrays", () => {
    // Arrange
    const entity = new Entity();
    const component = new Component<number>();
    const input = [ component.on(entity) ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [getInstancePoolName(entity)]: { isOnce: false }
    });
  });

  it("Parses component instance query with entity source for objects", () => {
    // Arrange
    const entity = new Entity();
    const component = new Component<number>();
    const input = { x: component.on(entity) } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [getInstancePoolName(entity)]: { isOnce: false }
    });
  });

  it("Parses relationship instance query with reference source for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const input = [ relationship.on("a") ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [getInstancePoolName(relationship)]: { isOnce: false },
      "a": { isOnce: false },
      [getTargetPoolName(0)]: { isOnce: false }
    });
  });

  it("Parses relationship instance query with reference source for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const input = { x: relationship.on("a") } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [getInstancePoolName(relationship)]: { isOnce: false },
      "a": { isOnce: false },
      [getTargetPoolName(0)]: { isOnce: false }
    });
  });

  it("Parses relationship instance query with entity source for arrays", () => {
    // Arrange
    const entity = new Entity();
    const relationship = new Relationship<number>();
    const input = [ relationship.on(entity) ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [getInstancePoolName(relationship)]: { isOnce: false },
      [getInstancePoolName(entity)]: { isOnce: false },
      [getTargetPoolName(0)]: { isOnce: false }
    });
  });

  it("Parses relationship instance query with entity source for objects", () => {
    // Arrange
    const entity = new Entity();
    const relationship = new Relationship<number>();
    const input = { x: relationship.on(entity) } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [getInstancePoolName(relationship)]: { isOnce: false },
      [getInstancePoolName(entity)]: { isOnce: false },
      [getTargetPoolName(0)]: { isOnce: false }
    });
  });

  it("Parses relationship instance query with reference target for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const input = [ relationship.to("a") ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [getInstancePoolName(relationship)]: { isOnce: false },
      [ENTITY_POOL]: { isOnce: false },
      "a": { isOnce: false }
    });
  });

  it("Parses relationship instance query with reference target for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const input = { x: relationship.to("a") } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [getInstancePoolName(relationship)]: { isOnce: false },
      [ENTITY_POOL]: { isOnce: false },
      "a": { isOnce: false }
    });
  });

  it("Parses relationship component with entity target for arrays", () => {
    // Arrange
    const entity = new Entity();
    const relationship = new Relationship<number>();
    const input = [ relationship.to(entity) ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [ENTITY_POOL]: { isOnce: false }
    });
  });

  it("Parses relationship component with entity target for objects", () => {
    // Arrange
    const entity = new Entity();
    const relationship = new Relationship<number>();
    const input = { x: relationship.to(entity) } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [ENTITY_POOL]: { isOnce: false }
    });
  });

  it("Parses entity wildcard with reference name for arrays", () => {
    // Arrange
    const input = [ Entity.as("a") ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      "a": { isOnce: false }
    });
  });

  it("Parses entity wildcard with reference name for objects", () => {
    // Arrange
    const input = { x: Entity.as("a") } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      "a": { isOnce: false }
    });
  });

  it("Parses entity wildcard with once clause for arrays", () => {
    // Arrange
    const input = [ Entity.once() ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [ENTITY_POOL]: { isOnce: true }
    });
  });

  it("Parses entity wildcard with once clause for objects", () => {
    // Arrange
    const input = { x: Entity.once() } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [ENTITY_POOL]: { isOnce: true }
    });
  });

  it("Parses component wildcard with reference name for arrays", () => {
    // Arrange
    const input = [ Component.as("a") ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      "a": { isOnce: false },
    });
  });

  it("Parses component wildcard with reference name for objects", () => {
    // Arrange
    const input = { x: Component.as("a") } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      "a": { isOnce: false },
    });
  });

  it("Parses component wildcard with once clause for arrays", () => {
    // Arrange
    const input = [ Component.once() ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [COMPONENT_POOL]: { isOnce: true },
    });
  });

  it("Parses component wildcard with once clause for objects", () => {
    // Arrange
    const input = { x: Component.once() } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [COMPONENT_POOL]: { isOnce: true },
    });
  });

  it("Parses component wildcard with reference source for arrays", () => {
    // Arrange
    const input = [ Component.on("source") ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [COMPONENT_POOL]: { isOnce: false },
      "source": { isOnce: false }
    });
  });

  it("Parses component wildcard with reference source for objects", () => {
    // Arrange
    const input = { x: Component.on("source") } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [COMPONENT_POOL]: { isOnce: false },
      "source": { isOnce: false }
    });
  });

  it("Parses component wildcard with entity source for arrays", () => {
    // Arrange
    const entity = new Entity();
    const input = [ Component.on(entity) ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [COMPONENT_POOL]: { isOnce: false },
      [getInstancePoolName(entity)]: { isOnce: false }
    });
  });

  it("Parses component wildcard with entity source for objects", () => {
    // Arrange
    const entity = new Entity();
    const input = { x: Component.on(entity) } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [COMPONENT_POOL]: { isOnce: false },
      [getInstancePoolName(entity)]: { isOnce: false }
    });
  });

  it("Parses relationship wildcard with reference name for arrays", () => {
    // Arrange
    const input = [ Relationship.as("a") ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      "a": { isOnce: false },
    });
  });

  it("Parses relationship wildcard with reference name for objects", () => {
    // Arrange
    const input = { x: Relationship.as("a") } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      "a": { isOnce: false },
    });
  });

  it("Parses relationship wildcard with once clause for arrays", () => {
    // Arrange
    const input = [ Relationship.once() ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [RELATIONSHIP_POOL]: { isOnce: true },
    });
  });

  it("Parses relationship wildcard with once clause for objects", () => {
    // Arrange
    const input = { x: Relationship.once() } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [RELATIONSHIP_POOL]: { isOnce: true },
    });
  });

  it("Parses relationship wildcard with reference source for arrays", () => {
    // Arrange
    const input = [ Relationship.on("source") ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [RELATIONSHIP_POOL]: { isOnce: false },
      "source": { isOnce: false },
      [getTargetPoolName(0)]: { isOnce: false }
    });
  });

  it("Parses relationship wildcard with reference source for objects", () => {
    // Arrange
    const input = { x: Relationship.on("source") } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [RELATIONSHIP_POOL]: { isOnce: false },
      "source": { isOnce: false },
      [getTargetPoolName(0)]: { isOnce: false },
    });
  });

  it("Parses relationship wildcard with entity source for arrays", () => {
    // Arrange
    const entity = new Entity();
    const input = [ Relationship.on(entity) ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [RELATIONSHIP_POOL]: { isOnce: false },
      [getInstancePoolName(entity)]: { isOnce: false },
      [getTargetPoolName(0)]: { isOnce: false }
    });
  });

  it("Parses relationship wildcard with entity source for objects", () => {
    // Arrange
    const entity = new Entity();
    const input = { x: Relationship.on(entity) } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [RELATIONSHIP_POOL]: { isOnce: false },
      [getInstancePoolName(entity)]: { isOnce: false },
      [getTargetPoolName(0)]: { isOnce: false },
    });
  });

  it("Parses relationship wildcard with reference target for arrays", () => {
    // Arrange
    const input = [ Relationship.to("target") ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [RELATIONSHIP_POOL]: { isOnce: false },
      [ENTITY_POOL]: { isOnce: false },
      "target": { isOnce: false }
    });
  });

  it("Parses relationship wildcard with reference target for objects", () => {
    // Arrange
    const input = { x: Relationship.to("target") } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [RELATIONSHIP_POOL]: { isOnce: false },
      [ENTITY_POOL]: { isOnce: false },
      "target": { isOnce: false }
    });
  });

  it("Parses relationship wildcard with entity target for arrays", () => {
    // Arrange
    const entity = new Entity();
    const input = [ Relationship.to(entity) ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [RELATIONSHIP_POOL]: { isOnce: false },
      [ENTITY_POOL]: { isOnce: false },
      [getInstancePoolName(entity)]: { isOnce: false }
    });
  });

  it("Parses relationship wildcard with entity target for objects", () => {
    // Arrange
    const entity = new Entity();
    const input = { x: Relationship.to(entity) } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [RELATIONSHIP_POOL]: { isOnce: false },
      [ENTITY_POOL]: { isOnce: false },
      [getInstancePoolName(entity)]: { isOnce: false }
    });
  });

  it("Parses component wildcard value query for arrays", () => {
    // Arrange
    const input = [ Component.value() ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [COMPONENT_POOL]: { isOnce: false },
      [ENTITY_POOL]: { isOnce: false }
    });
  });

  it("Parses component wildcard value query for objects", () => {
    // Arrange
    const input = { x: Component.value() } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [COMPONENT_POOL]: { isOnce: false },
      [ENTITY_POOL]: { isOnce: false }
    });
  });

  it("Parses component wildcard value query with reference name for arrays", () => {
    // Arrange
    const input = [ Component.as("a").value() ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      "a": { isOnce: false },
      [ENTITY_POOL]: { isOnce: false }
    });
  });

  it("Parses component wildcard value query with reference name for objects", () => {
    // Arrange
    const input = { x: Component.as("a").value() } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      "a": { isOnce: false },
      [ENTITY_POOL]: { isOnce: false }
    });
  });

  it("Parses component wildcard value query with once clause for arrays", () => {
    // Arrange
    const input = [ Component.once().value() ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [COMPONENT_POOL]: { isOnce: true },
      [ENTITY_POOL]: { isOnce: false }
    });
  });

  it("Parses component wildcard value query with once clause for objects", () => {
    // Arrange
    const input = { x: Component.once().value() } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [COMPONENT_POOL]: { isOnce: true },
      [ENTITY_POOL]: { isOnce: false }
    });
  });

  it("Parses component wildcard value query with reference source for arrays", () => {
    // Arrange
    const input = [ Component.on("source").value() ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [COMPONENT_POOL]: { isOnce: false },
      "source": { isOnce: false }
    });
  });

  it("Parses component wildcard value query with reference source for objects", () => {
    // Arrange
    const input = { x: Component.on("source").value() } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [COMPONENT_POOL]: { isOnce: false },
      "source": { isOnce: false }
    });
  });

  it("Parses component wildcard value query with entity source for arrays", () => {
    // Arrange
    const entity = new Entity();
    const input = [ Component.on(entity).value() ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [COMPONENT_POOL]: { isOnce: false },
      [getInstancePoolName(entity)]: { isOnce: false }
    });
  });

  it("Parses component wildcard value query with entity source for objects", () => {
    // Arrange
    const entity = new Entity();
    const input = { x: Component.on(entity).value() } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [COMPONENT_POOL]: { isOnce: false },
      [getInstancePoolName(entity)]: { isOnce: false }
    });
  });

  it("Parses relationship wildcard value query for arrays", () => {
    // Arrange
    const input = [ Relationship.value() ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [RELATIONSHIP_POOL]: { isOnce: false },
      [ENTITY_POOL]: { isOnce: false },
      [getTargetPoolName(0)]: { isOnce: false }
    });
  });

  it("Parses relationship wildcard value query for objects", () => {
    // Arrange
    const input = { x: Relationship.value() } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [RELATIONSHIP_POOL]: { isOnce: false },
      [ENTITY_POOL]: { isOnce: false },
      [getTargetPoolName(0)]: { isOnce: false }
    });
  });

  it("Parses relationship wildcard value query with reference name for arrays", () => {
    // Arrange
    const input = [ Relationship.as("a").value() ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      "a": { isOnce: false },
      [ENTITY_POOL]: { isOnce: false },
      [getTargetPoolName(0)]: { isOnce: false }
    });
  });

  it("Parses relationship wildcard value query with reference name for objects", () => {
    // Arrange
    const input = { x: Relationship.as("a").value() } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      "a": { isOnce: false },
      [ENTITY_POOL]: { isOnce: false },
      [getTargetPoolName(0)]: { isOnce: false }
    });
  });

  it("Parses relationship wildcard value query with once clause for arrays", () => {
    // Arrange
    const input = [ Relationship.once().value() ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [RELATIONSHIP_POOL]: { isOnce: true },
      [ENTITY_POOL]: { isOnce: false },
      [getTargetPoolName(0)]: { isOnce: false }
    });
  });

  it("Parses relationship wildcard value query with once clause for objects", () => {
    // Arrange
    const input = { x: Relationship.once().value() } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [RELATIONSHIP_POOL]: { isOnce: true },
      [ENTITY_POOL]: { isOnce: false },
      [getTargetPoolName(0)]: { isOnce: false }
    });
  });

  it("Parses relationship wildcard value query with reference source for arrays", () => {
    // Arrange
    const input = [ Relationship.on("source").value() ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [RELATIONSHIP_POOL]: { isOnce: false },
      "source": { isOnce: false },
      [getTargetPoolName(0)]: { isOnce: false }
    });
  });

  it("Parses relationship wildcard value query with reference source for objects", () => {
    // Arrange
    const input = { x: Relationship.on("source").value() } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [RELATIONSHIP_POOL]: { isOnce: false },
      "source": { isOnce: false },
      [getTargetPoolName(0)]: { isOnce: false }
    });
  });

  it("Parses relationship wildcard value query with reference target for arrays", () => {
    // Arrange
    const input = [ Relationship.to("target").value() ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [RELATIONSHIP_POOL]: { isOnce: false },
      [ENTITY_POOL]: { isOnce: false },
      "target": { isOnce: false }
    });
  });

  it("Parses relationship wildcard value query with reference target for objects", () => {
    // Arrange
    const input = { x: Relationship.to("target").value() } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [RELATIONSHIP_POOL]: { isOnce: false },
      [ENTITY_POOL]: { isOnce: false },
      "target": { isOnce: false }
    });
  });

  it("Parses relationship wildcard value query with entity source for arrays", () => {
    // Arrange
    const entity = new Entity();
    const input = [ Relationship.on(entity).value() ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [RELATIONSHIP_POOL]: { isOnce: false },
      [getInstancePoolName(entity)]: { isOnce: false },
      [getTargetPoolName(0)]: { isOnce: false },
    });
  });

  it("Parses relationship wildcard value query with entity source for objects", () => {
    // Arrange
    const entity = new Entity();
    const input = { x: Relationship.on(entity).value() } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [RELATIONSHIP_POOL]: { isOnce: false },
      [getInstancePoolName(entity)]: { isOnce: false },
      [getTargetPoolName(0)]: { isOnce: false },
    });
  });

  it("Parses relationship wildcard value query with entity target for arrays", () => {
    // Arrange
    const entity = new Entity();
    const input = [ Relationship.to(entity).value() ] as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [RELATIONSHIP_POOL]: { isOnce: false },
      [ENTITY_POOL]: { isOnce: false },
      [getInstancePoolName(entity)]: { isOnce: false },
    });
  });

  it("Parses relationship wildcard value query with entity target for objects", () => {
    // Arrange
    const entity = new Entity();
    const input = { x: Relationship.to(entity).value() } as const;

    // Act
    const pools = parsePoolInfos(input);

    // Assert
    assert.deepStrictEqual(pools, {
      [RELATIONSHIP_POOL]: { isOnce: false },
      [ENTITY_POOL]: { isOnce: false },
      [getInstancePoolName(entity)]: { isOnce: false },
    });
  });
});

describe("parseConstraints", () => {
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

  it("Parses component class for arrays", (test) => {
    // Arrange
    const input = [ Component ] as const;

    const isAComponent = constraintFunctions.isA(Component);

    constraintFunctions.isA = test.mock.fn(
      constraintFunctions.isA,
      () => isAComponent
    );

    const expected: Constraints = {
      poolSpecific: {
        [COMPONENT_POOL]: [ isAComponent ],
      },
      crossPool: [],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component class for objects", (test) => {
    // Arrange
    const input = { x: Component } as const;

    const isAComponent = constraintFunctions.isA(Component);

    constraintFunctions.isA = test.mock.fn(
      constraintFunctions.isA,
      () => isAComponent
    );

    const expected: Constraints = {
      poolSpecific: {
        [COMPONENT_POOL]: [ isAComponent ],
      },
      crossPool: [],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship class for arrays", (test) => {
    // Arrange
    const input = [ Relationship ] as const;

    const isARelationship = constraintFunctions.isA(Relationship);

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isARelationship);

    const expected: Constraints = {
      poolSpecific: {
        [RELATIONSHIP_POOL]: [ isARelationship ],
      },
      crossPool: [],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship class for objects", (test) => {
    // Arrange
    const input = { x: Relationship } as const;

    const isARelationship = constraintFunctions.isA(Relationship);

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isARelationship);

    const expected: Constraints = {
      poolSpecific: {
        [RELATIONSHIP_POOL]: [ isARelationship ],
      },
      crossPool: [],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component instance for arrays", (test) => {
    // Arrange
    const component = new Component<number>();
    const input = [ component ] as const;

    const hasComponent = constraintFunctions.has(component);

    constraintFunctions.has = test.mock.fn(constraintFunctions.has, () => hasComponent);

    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [ hasComponent ],
      },
      crossPool: [],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component instance for objects", (test) => {
    // Arrange
    const component = new Component<number>();
    const input = { x: component } as const;

    const hasComponent = constraintFunctions.has(component);

    constraintFunctions.has = test.mock.fn(constraintFunctions.has, () => hasComponent);

    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [ hasComponent ],
      },
      crossPool: [],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship instance for arrays", (test) => {
    // Arrange
    const relationship = new Relationship<number>();
    const input = [ relationship ] as const;

    const isRelationship = constraintFunctions.is(relationship);
    const hasRelationship = constraintFunctions.has(relationship);
    const entityTargetsPool = constraintFunctions.poolTargetsPool(
      ENTITY_POOL,
      getInstancePoolName(relationship),
      getTargetPoolName(0),
    );

    constraintFunctions.is = test.mock.fn(constraintFunctions.is, () => isRelationship);
    constraintFunctions.has = test.mock.fn(constraintFunctions.has, () => hasRelationship);
    constraintFunctions.poolTargetsPool = test.mock.fn(constraintFunctions.poolTargetsPool, () => entityTargetsPool);

    const expected: Constraints = {
      poolSpecific: {
        [getInstancePoolName(relationship)]: [ isRelationship ],
        [ENTITY_POOL]: [ hasRelationship ],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        entityTargetsPool,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship instance for objects", (test) => {
    // Arrange
    const relationship = new Relationship<number>();
    const input = { x: relationship } as const;

    const isRelationship = constraintFunctions.is(relationship);
    const hasRelationship = constraintFunctions.has(relationship);
    const entityTargetsPool = constraintFunctions.poolTargetsPool(
      ENTITY_POOL,
      getInstancePoolName(relationship),
      getTargetPoolName(0),
    );

    constraintFunctions.is = test.mock.fn(constraintFunctions.is, () => isRelationship);
    constraintFunctions.has = test.mock.fn(constraintFunctions.has, () => hasRelationship);
    constraintFunctions.poolTargetsPool = test.mock.fn(constraintFunctions.poolTargetsPool, () => entityTargetsPool);

    const expected: Constraints = {
      poolSpecific: {
        [getInstancePoolName(relationship)]: [ isRelationship ],
        [ENTITY_POOL]: [ hasRelationship ],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        entityTargetsPool,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component instance query with reference source for arrays", (test) => {
    // Arrange
    const component = new Component<number>();
    const input = [ component.on("source") ] as const;

    const hasComponent = constraintFunctions.has(component);

    constraintFunctions.has = test.mock.fn(constraintFunctions.has, () => hasComponent);

    const expected: Constraints = {
      poolSpecific: {
        "source": [ hasComponent ],
      },
      crossPool: [],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component instance query with reference source for objects", (test) => {
    // Arrange
    const component = new Component<number>();
    const input = { x: component.on("source") } as const;

    const hasComponent = constraintFunctions.has(component);

    constraintFunctions.has = test.mock.fn(constraintFunctions.has, () => hasComponent);

    const expected: Constraints = {
      poolSpecific: {
        "source": [ hasComponent ],
      },
      crossPool: [],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component instance query with entity source for arrays", (test) => {
    // Arrange
    const entity = new Entity();
    const component = new Component<number>();
    const input = [ component.on(entity) ] as const;

    const isEntity = constraintFunctions.is(entity);
    const hasComponent = constraintFunctions.has(component);

    constraintFunctions.is = test.mock.fn(constraintFunctions.is, () => isEntity);
    constraintFunctions.has = test.mock.fn(constraintFunctions.has, () => hasComponent);

    const expected: Constraints = {
      poolSpecific: {
        [getInstancePoolName(entity)]: [ isEntity, hasComponent ],
      },
      crossPool: [],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component instance query with entity source for objects", (test) => {
    // Arrange
    const entity = new Entity();
    const component = new Component<number>();
    const input = { x: component.on(entity) } as const;

    const isEntity = constraintFunctions.is(entity);
    const hasComponent = constraintFunctions.has(component);

    constraintFunctions.is = test.mock.fn(constraintFunctions.is, () => isEntity);
    constraintFunctions.has = test.mock.fn(constraintFunctions.has, () => hasComponent);

    const expected: Constraints = {
      poolSpecific: {
        [getInstancePoolName(entity)]: [ isEntity, hasComponent ],
      },
      crossPool: [],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship instance query with reference source for arrays", (test) => {
    // Arrange
    const relationship = new Relationship<number>();
    const input = [ relationship.on("source") ] as const;

    const isRelationship = constraintFunctions.is(relationship);
    const hasRelationship = constraintFunctions.has(relationship);
    const sourceTargetsRelationship = constraintFunctions.poolTargetsPool(
      "source",
      getInstancePoolName(relationship),
      getTargetPoolName(0),
    );

    constraintFunctions.is = test.mock.fn(constraintFunctions.is, () => isRelationship);
    constraintFunctions.has = test.mock.fn(constraintFunctions.has, () => hasRelationship);
    constraintFunctions.poolTargetsPool = test.mock.fn(
      constraintFunctions.poolTargetsPool,
      () => sourceTargetsRelationship,
    );

    const expected: Constraints = {
      poolSpecific: {
        [getInstancePoolName(relationship)]: [ isRelationship ],
        ["source"]: [ hasRelationship ],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        sourceTargetsRelationship,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship instance query with reference source for objects", (test) => {
    // Arrange
    const relationship = new Relationship<number>();
    const input = { x: relationship.on("source") } as const;

    const isRelationship = constraintFunctions.is(relationship);
    const hasRelationship = constraintFunctions.has(relationship);
    const sourceTargetsRelationship = constraintFunctions.poolTargetsPool(
      "source",
      getInstancePoolName(relationship),
      getTargetPoolName(0),
    );

    constraintFunctions.is = test.mock.fn(constraintFunctions.is, () => isRelationship);
    constraintFunctions.has = test.mock.fn(constraintFunctions.has, () => hasRelationship);
    constraintFunctions.poolTargetsPool = test.mock.fn(
      constraintFunctions.poolTargetsPool,
      () => sourceTargetsRelationship,
    );

    const expected: Constraints = {
      poolSpecific: {
        [getInstancePoolName(relationship)]: [ isRelationship ],
        ["source"]: [ hasRelationship ],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        sourceTargetsRelationship,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship instance query with entity source for arrays", (test) => {
    // Arrange
    const entity = new Entity();
    const relationship = new Relationship<number>();
    const input = [ relationship.on(entity) ] as const;

    const isRelationship = constraintFunctions.is(relationship);
    const isEntity = constraintFunctions.is(entity);
    const hasRelationship = constraintFunctions.has(relationship);
    const entityTargetsRelationship = constraintFunctions.poolTargetsPool(
      getInstancePoolName(entity),
      getInstancePoolName(relationship),
      getTargetPoolName(0),
    );

    let callCountOfIs = 0;
    constraintFunctions.is = test.mock.fn(constraintFunctions.is, () => {
      callCountOfIs += 1;
      if (callCountOfIs === 1) {
        return isRelationship;
      } else {
        return isEntity;
      }
    });
    constraintFunctions.has = test.mock.fn(constraintFunctions.has, () => {
      return hasRelationship;
    });
    constraintFunctions.poolTargetsPool = test.mock.fn(constraintFunctions.poolTargetsPool, () => {
      return entityTargetsRelationship;
    });

    const expected: Constraints = {
      poolSpecific: {
        [getInstancePoolName(relationship)]: [ isRelationship ],
        [getInstancePoolName(entity)]: [ isEntity, hasRelationship ],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        entityTargetsRelationship,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship instance query with entity source for objects", (test) => {
    // Arrange
    const entity = new Entity();
    const relationship = new Relationship<number>();
    const input = { x: relationship.on(entity) } as const;

    const isRelationship = constraintFunctions.is(relationship);
    const isEntity = constraintFunctions.is(entity);
    const hasRelationship = constraintFunctions.has(relationship);
    const entityTargetsRelationship = constraintFunctions.poolTargetsPool(
      getInstancePoolName(entity),
      getInstancePoolName(relationship),
      getTargetPoolName(0),
    );

    let callCountOfIs = 0;
    constraintFunctions.is = test.mock.fn(constraintFunctions.is, () => {
      callCountOfIs += 1;
      if (callCountOfIs === 1) {
        return isRelationship;
      } else {
        return isEntity;
      }
    });
    constraintFunctions.has = test.mock.fn(constraintFunctions.has, () => hasRelationship);
    constraintFunctions.poolTargetsPool = test.mock.fn(
      constraintFunctions.poolTargetsPool,
      () => entityTargetsRelationship,
    );

    const expected: Constraints = {
      poolSpecific: {
        [getInstancePoolName(relationship)]: [ isRelationship ],
        [getInstancePoolName(entity)]: [ isEntity, hasRelationship ],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        entityTargetsRelationship,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship instance query with reference target for arrays", (test) => {
    // Arrange
    const relationship = new Relationship<number>();
    const input = [ relationship.to("target") ] as const;

    const isRelationship = constraintFunctions.is(relationship);
    const hasRelationship = constraintFunctions.has(relationship);
    const entityTargetsRelationship = constraintFunctions.poolTargetsPool(
      ENTITY_POOL,
      getInstancePoolName(relationship),
      "target",
    );

    constraintFunctions.is = test.mock.fn(constraintFunctions.is, () => isRelationship);
    constraintFunctions.has = test.mock.fn(constraintFunctions.has, () => hasRelationship);
    constraintFunctions.poolTargetsPool = test.mock.fn(
      constraintFunctions.poolTargetsPool,
      () => entityTargetsRelationship,
    );

    const expected: Constraints = {
      poolSpecific: {
        [getInstancePoolName(relationship)]: [ isRelationship ],
        [ENTITY_POOL]: [ hasRelationship ],
        ["target"]: [],
      },
      crossPool: [
        entityTargetsRelationship,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship instance query with reference target for objects", (test) => {
    // Arrange
    const relationship = new Relationship<number>();
    const input = { x: relationship.to("target") } as const;

    const isRelationship = constraintFunctions.is(relationship);
    const hasRelationship = constraintFunctions.has(relationship);
    const entityTargetsRelationship = constraintFunctions.poolTargetsPool(
      ENTITY_POOL,
      getInstancePoolName(relationship),
      "target",
    );

    constraintFunctions.is = test.mock.fn(constraintFunctions.is, () => isRelationship);
    constraintFunctions.has = test.mock.fn(constraintFunctions.has, () => hasRelationship);
    constraintFunctions.poolTargetsPool = test.mock.fn(
      constraintFunctions.poolTargetsPool,
      () => entityTargetsRelationship,
    );

    const expected: Constraints = {
      poolSpecific: {
        [getInstancePoolName(relationship)]: [ isRelationship ],
        [ENTITY_POOL]: [ hasRelationship ],
        ["target"]: [],
      },
      crossPool: [
        entityTargetsRelationship,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship component with entity target for arrays", (test) => {
    // Arrange
    const entity = new Entity();
    const relationship = new Relationship<number>();
    const input = [ relationship.to(entity) ] as const;

    const hasRelationshipComponent = constraintFunctions.has(relationship.to(entity));

    constraintFunctions.has = test.mock.fn(constraintFunctions.has, () => hasRelationshipComponent);

    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [ hasRelationshipComponent ],
      },
      crossPool: [],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship component with entity target for objects", (test) => {
    // Arrange
    const entity = new Entity();
    const relationship = new Relationship<number>();
    const input = { x: relationship.to(entity) } as const;

    const hasRelationshipComponent = constraintFunctions.has(relationship.to(entity));

    constraintFunctions.has = test.mock.fn(constraintFunctions.has, () => hasRelationshipComponent);

    const expected: Constraints = {
      poolSpecific: {
        [ENTITY_POOL]: [ hasRelationshipComponent ],
      },
      crossPool: [],
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

  it("Parses component wildcard with reference name for arrays", (test) => {
    // Arrange
    const input = [ Component.as("a") ] as const;

    const isAComponent = constraintFunctions.isA(Component);

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isAComponent);

    const expected: Constraints = {
      poolSpecific: {
        ["a"]: [ isAComponent ],
      },
      crossPool: [],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component wildcard with reference name for objects", (test) => {
    // Arrange
    const input = { x: Component.as("a") } as const;

    const isAComponent = constraintFunctions.isA(Component);

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isAComponent);

    const expected: Constraints = {
      poolSpecific: {
        ["a"]: [ isAComponent ],
      },
      crossPool: [],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component wildcard with reference source for arrays", (test) => {
    // Arrange
    const input = [ Component.on("source") ] as const;

    const isAComponent = constraintFunctions.isA(Component);
    const entityHasComponent = constraintFunctions.poolHasPool("source", COMPONENT_POOL);

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isAComponent);
    constraintFunctions.poolHasPool = test.mock.fn(constraintFunctions.poolHasPool, () => entityHasComponent);

    const expected: Constraints = {
      poolSpecific: {
        [COMPONENT_POOL]: [ isAComponent ],
        "source": [],
      },
      crossPool: [
        entityHasComponent,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component wildcard with reference source for objects", (test) => {
    // Arrange
    const input = { x: Component.on("source") } as const;

    const isAComponent = constraintFunctions.isA(Component);
    const entityHasComponent = constraintFunctions.poolHasPool("source", COMPONENT_POOL);

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isAComponent);
    constraintFunctions.poolHasPool = test.mock.fn(constraintFunctions.poolHasPool, () => entityHasComponent);

    const expected: Constraints = {
      poolSpecific: {
        [COMPONENT_POOL]: [ isAComponent ],
        "source": [],
      },
      crossPool: [
        entityHasComponent,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component wildcard with entity source for arrays", (test) => {
    // Arrange
    const entity = new Entity();
    const input = [ Component.on(entity) ] as const;

    const isAComponent = constraintFunctions.isA(Component);
    const isEntity = constraintFunctions.is(entity);
    const entityHasComponent = constraintFunctions.poolHasPool(getInstancePoolName(entity), COMPONENT_POOL);

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isAComponent);
    constraintFunctions.is = test.mock.fn(constraintFunctions.is, () => isEntity);
    constraintFunctions.poolHasPool = test.mock.fn(constraintFunctions.poolHasPool, () => entityHasComponent);

    const expected: Constraints = {
      poolSpecific: {
        [COMPONENT_POOL]: [ isAComponent ],
        [getInstancePoolName(entity)]: [ isEntity ],
      },
      crossPool: [
        entityHasComponent,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component wildcard with entity source for objects", (test) => {
    // Arrange
    const entity = new Entity();
    const input = { x: Component.on(entity) } as const;

    const isAComponent = constraintFunctions.isA(Component);
    const isEntity = constraintFunctions.is(entity);
    const entityHasComponent = constraintFunctions.poolHasPool(getInstancePoolName(entity), COMPONENT_POOL);

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isAComponent);
    constraintFunctions.is = test.mock.fn(constraintFunctions.is, () => isEntity);
    constraintFunctions.poolHasPool = test.mock.fn(constraintFunctions.poolHasPool, () => entityHasComponent);

    const expected: Constraints = {
      poolSpecific: {
        [COMPONENT_POOL]: [ isAComponent ],
        [getInstancePoolName(entity)]: [ isEntity ],
      },
      crossPool: [
        entityHasComponent,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard with reference name for arrays", (test) => {
    // Arrange
    const input = [ Relationship.as("a") ] as const;

    const isARelationship = constraintFunctions.isA(Relationship);

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isARelationship);

    const expected: Constraints = {
      poolSpecific: {
        ["a"]: [ isARelationship ],
      },
      crossPool: [],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard with reference name for objects", (test) => {
    // Arrange
    const input = { x: Relationship.as("a") } as const;

    const isARelationship = constraintFunctions.isA(Relationship);

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isARelationship);

    const expected: Constraints = {
      poolSpecific: {
        ["a"]: [ isARelationship ],
      },
      crossPool: [],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard with reference source for arrays", (test) => {
    // Arrange
    const input = [ Relationship.on("source") ] as const;

    const isARelationship = constraintFunctions.isA(Relationship);
    const entityTargetsRelationship = constraintFunctions.poolTargetsPool(
      "source",
      RELATIONSHIP_POOL,
      getTargetPoolName(0),
    );

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isARelationship);
    constraintFunctions.poolTargetsPool = test.mock.fn(
      constraintFunctions.poolTargetsPool,
      () => entityTargetsRelationship,
    );

    const expected: Constraints = {
      poolSpecific: {
        [RELATIONSHIP_POOL]: [ isARelationship ],
        ["source"]: [],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        entityTargetsRelationship,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard with reference source for objects", (test) => {
    // Arrange
    const input = { x: Relationship.on("source") } as const;

    const isARelationship = constraintFunctions.isA(Relationship);
    const entityTargetsRelationship = constraintFunctions.poolTargetsPool(
      "source",
      RELATIONSHIP_POOL,
      getTargetPoolName(0),
    );

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isARelationship);
    constraintFunctions.poolTargetsPool = test.mock.fn(
      constraintFunctions.poolTargetsPool,
      () => entityTargetsRelationship,
    );

    const expected: Constraints = {
      poolSpecific: {
        [RELATIONSHIP_POOL]: [ isARelationship ],
        ["source"]: [],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        entityTargetsRelationship,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard with entity source for arrays", (test) => {
    // Arrange
    const entity = new Entity();
    const input = [ Relationship.on(entity) ] as const;

    const isARelationship = constraintFunctions.isA(Relationship);
    const isEntity = constraintFunctions.is(entity);
    const entityTargetsRelationship = constraintFunctions.poolTargetsPool(
      getInstancePoolName(entity),
      RELATIONSHIP_POOL,
      getTargetPoolName(0),
    );

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isARelationship);
    constraintFunctions.is = test.mock.fn(constraintFunctions.is, () => isEntity);
    constraintFunctions.poolTargetsPool = test.mock.fn(
      constraintFunctions.poolTargetsPool,
      () => entityTargetsRelationship,
    );

    const expected: Constraints = {
      poolSpecific: {
        [RELATIONSHIP_POOL]: [ isARelationship ],
        [getInstancePoolName(entity)]: [ isEntity ],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        entityTargetsRelationship,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard with entity source for objects", (test) => {
    // Arrange
    const entity = new Entity();
    const input = { x: Relationship.on(entity) } as const;

    const isARelationship = constraintFunctions.isA(Relationship);
    const isEntity = constraintFunctions.is(entity);
    const entityTargetsRelationship = constraintFunctions.poolTargetsPool(
      getInstancePoolName(entity),
      RELATIONSHIP_POOL,
      getTargetPoolName(0),
    );

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isARelationship);
    constraintFunctions.is = test.mock.fn(constraintFunctions.is, () => isEntity);
    constraintFunctions.poolTargetsPool = test.mock.fn(
      constraintFunctions.poolTargetsPool,
      () => entityTargetsRelationship,
    );

    const expected: Constraints = {
      poolSpecific: {
        [RELATIONSHIP_POOL]: [ isARelationship ],
        [getInstancePoolName(entity)]: [ isEntity ],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        entityTargetsRelationship,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard with reference target for arrays", (test) => {
    // Arrange
    const input = [ Relationship.to("target") ] as const;

    const isARelationship = constraintFunctions.isA(Relationship);
    const entityTargetsRelationship = constraintFunctions.poolTargetsPool(ENTITY_POOL, RELATIONSHIP_POOL, "target");

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isARelationship);
    constraintFunctions.poolTargetsPool = test.mock.fn(
      constraintFunctions.poolTargetsPool,
      () => entityTargetsRelationship,
    );

    const expected: Constraints = {
      poolSpecific: {
        [RELATIONSHIP_POOL]: [ isARelationship ],
        [ENTITY_POOL]: [],
        ["target"]: [],
      },
      crossPool: [
        entityTargetsRelationship,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard with reference target for objects", (test) => {
    // Arrange
    const input = { x: Relationship.to("target") } as const;

    const isARelationship = constraintFunctions.isA(Relationship);
    const entityTargetsRelationship = constraintFunctions.poolTargetsPool(ENTITY_POOL, RELATIONSHIP_POOL, "target");

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isARelationship);
    constraintFunctions.poolTargetsPool = test.mock.fn(
      constraintFunctions.poolTargetsPool,
      () => entityTargetsRelationship,
    );

    const expected: Constraints = {
      poolSpecific: {
        [RELATIONSHIP_POOL]: [ isARelationship ],
        [ENTITY_POOL]: [],
        ["target"]: [],
      },
      crossPool: [
        entityTargetsRelationship,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard with entity target for arrays", (test) => {
    // Arrange
    const entity = new Entity();
    const input = [ Relationship.to(entity) ] as const;

    const isARelationship = constraintFunctions.isA(Relationship);
    const isEntity = constraintFunctions.is(entity);
    const entityTargetsRelationship = constraintFunctions.poolTargetsPool(
      ENTITY_POOL,
      RELATIONSHIP_POOL,
      getInstancePoolName(entity),
    );

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isARelationship);
    constraintFunctions.is = test.mock.fn(constraintFunctions.is, () => isEntity);
    constraintFunctions.poolTargetsPool = test.mock.fn(
      constraintFunctions.poolTargetsPool,
      () => entityTargetsRelationship,
    );

    const expected: Constraints = {
      poolSpecific: {
        [RELATIONSHIP_POOL]: [ isARelationship ],
        [ENTITY_POOL]: [],
        [getInstancePoolName(entity)]: [ isEntity ],
      },
      crossPool: [
        entityTargetsRelationship,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard with entity target for objects", (test) => {
    // Arrange
    const entity = new Entity();
    const input = { x: Relationship.to(entity) } as const;

    const isARelationship = constraintFunctions.isA(Relationship);
    const isEntity = constraintFunctions.is(entity);
    const entityTargetsRelationship = constraintFunctions.poolTargetsPool(
      ENTITY_POOL,
      RELATIONSHIP_POOL,
      getInstancePoolName(entity),
    );

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isARelationship);
    constraintFunctions.is = test.mock.fn(constraintFunctions.is, () => isEntity);
    constraintFunctions.poolTargetsPool = test.mock.fn(
      constraintFunctions.poolTargetsPool,
      () => entityTargetsRelationship,
    );

    const expected: Constraints = {
      poolSpecific: {
        [RELATIONSHIP_POOL]: [ isARelationship ],
        [ENTITY_POOL]: [],
        [getInstancePoolName(entity)]: [ isEntity ],
      },
      crossPool: [
        entityTargetsRelationship,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component wildcard value query for arrays", (test) => {
    // Arrange
    const input = [ Component.value() ] as const;

    const isAComponent = constraintFunctions.isA(Component);
    const entityHasComponent = constraintFunctions.poolHasPool(ENTITY_POOL, COMPONENT_POOL);

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isAComponent);
    constraintFunctions.poolHasPool = test.mock.fn(constraintFunctions.poolHasPool, () => entityHasComponent);

    const expected: Constraints = {
      poolSpecific: {
        [COMPONENT_POOL]: [ isAComponent ],
        [ENTITY_POOL]: [],
      },
      crossPool: [
        entityHasComponent,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component wildcard value query for objects", (test) => {
    // Arrange
    const input = { x: Component.value() } as const;

    const isAComponent = constraintFunctions.isA(Component);
    const entityHasComponent = constraintFunctions.poolHasPool(ENTITY_POOL, COMPONENT_POOL);

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isAComponent);
    constraintFunctions.poolHasPool = test.mock.fn(constraintFunctions.poolHasPool, () => entityHasComponent);

    const expected: Constraints = {
      poolSpecific: {
        [COMPONENT_POOL]: [ isAComponent ],
        [ENTITY_POOL]: [],
      },
      crossPool: [
        entityHasComponent,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component wildcard value query with reference name for arrays", (test) => {
    // Arrange
    const input = [ Component.as("a").value() ] as const;

    const isAComponent = constraintFunctions.isA(Component);
    const entityHasComponent = constraintFunctions.poolHasPool(ENTITY_POOL, "a");

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isAComponent);
    constraintFunctions.poolHasPool = test.mock.fn(constraintFunctions.poolHasPool, () => entityHasComponent);

    const expected: Constraints = {
      poolSpecific: {
        ["a"]: [ isAComponent ],
        [ENTITY_POOL]: [],
      },
      crossPool: [
        entityHasComponent,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component wildcard value query with reference name for objects", (test) => {
    // Arrange
    const input = { x: Component.as("a").value() } as const;

    const isAComponent = constraintFunctions.isA(Component);
    const entityHasComponent = constraintFunctions.poolHasPool(ENTITY_POOL, "a");

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isAComponent);
    constraintFunctions.poolHasPool = test.mock.fn(constraintFunctions.poolHasPool, () => entityHasComponent);

    const expected: Constraints = {
      poolSpecific: {
        ["a"]: [ isAComponent ],
        [ENTITY_POOL]: [],
      },
      crossPool: [
        entityHasComponent,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component wildcard value query with reference source for arrays", (test) => {
    // Arrange
    const input = [ Component.on("source").value() ] as const;

    const isAComponent = constraintFunctions.isA(Component);
    const entityHasComponent = constraintFunctions.poolHasPool("source", COMPONENT_POOL);

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isAComponent);
    constraintFunctions.poolHasPool = test.mock.fn(constraintFunctions.poolHasPool, () => entityHasComponent);

    const expected: Constraints = {
      poolSpecific: {
        [COMPONENT_POOL]: [ isAComponent ],
        "source": [],
      },
      crossPool: [
        entityHasComponent,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component wildcard value query with reference source for objects", (test) => {
    // Arrange
    const input = { x: Component.on("source").value() } as const;

    const isAComponent = constraintFunctions.isA(Component);
    const entityHasComponent = constraintFunctions.poolHasPool("source", COMPONENT_POOL);

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isAComponent);
    constraintFunctions.poolHasPool = test.mock.fn(constraintFunctions.poolHasPool, () => entityHasComponent);

    const expected: Constraints = {
      poolSpecific: {
        [COMPONENT_POOL]: [ isAComponent ],
        "source": [],
      },
      crossPool: [
        entityHasComponent,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component wildcard value query with entity source for arrays", (test) => {
    // Arrange
    const entity = new Entity();
    const input = [ Component.on(entity).value() ] as const;

    const isAComponent = constraintFunctions.isA(Component);
    const isEntity = constraintFunctions.is(entity);
    const entityHasComponent = constraintFunctions.poolHasPool(getInstancePoolName(entity), COMPONENT_POOL);

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isAComponent);
    constraintFunctions.is = test.mock.fn(constraintFunctions.is, () => isEntity);
    constraintFunctions.poolHasPool = test.mock.fn(constraintFunctions.poolHasPool, () => entityHasComponent);

    const expected: Constraints = {
      poolSpecific: {
        [COMPONENT_POOL]: [ isAComponent ],
        [getInstancePoolName(entity)]: [ isEntity ],
      },
      crossPool: [
        entityHasComponent,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses component wildcard value query with entity source for objects", (test) => {
    // Arrange
    const entity = new Entity();
    const input = { x: Component.on(entity).value() } as const;

    const isAComponent = constraintFunctions.isA(Component);
    const isEntity = constraintFunctions.is(entity);
    const entityHasComponent = constraintFunctions.poolHasPool(getInstancePoolName(entity), COMPONENT_POOL);

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isAComponent);
    constraintFunctions.is = test.mock.fn(constraintFunctions.is, () => isEntity);
    constraintFunctions.poolHasPool = test.mock.fn(constraintFunctions.poolHasPool, () => entityHasComponent);

    const expected: Constraints = {
      poolSpecific: {
        [COMPONENT_POOL]: [ isAComponent ],
        [getInstancePoolName(entity)]: [ isEntity ],
      },
      crossPool: [
        entityHasComponent,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard value query for arrays", (test) => {
    // Arrange
    const input = [ Relationship.value() ] as const;

    const isARelationship = constraintFunctions.isA(Relationship);
    const entityTargetsRelationship = constraintFunctions.poolTargetsPool(
      ENTITY_POOL,
      RELATIONSHIP_POOL,
      getTargetPoolName(0),
    );

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isARelationship);
    constraintFunctions.poolTargetsPool = test.mock.fn(
      constraintFunctions.poolTargetsPool,
      () => entityTargetsRelationship,
    );

    const expected: Constraints = {
      poolSpecific: {
        [RELATIONSHIP_POOL]: [ isARelationship ],
        [ENTITY_POOL]: [],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        entityTargetsRelationship,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard value query for objects", (test) => {
    // Arrange
    const input = { x: Relationship.value() } as const;

    const isARelationship = constraintFunctions.isA(Relationship);
    const entityTargetsRelationship = constraintFunctions.poolTargetsPool(
      ENTITY_POOL,
      RELATIONSHIP_POOL,
      getTargetPoolName(0),
    );

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isARelationship);
    constraintFunctions.poolTargetsPool = test.mock.fn(
      constraintFunctions.poolTargetsPool,
      () => entityTargetsRelationship,
    );

    const expected: Constraints = {
      poolSpecific: {
        [RELATIONSHIP_POOL]: [ isARelationship ],
        [ENTITY_POOL]: [],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        entityTargetsRelationship,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard value query with reference name for arrays", (test) => {
    // Arrange
    const input = [ Relationship.as("a").value() ] as const;

    const isARelationship = constraintFunctions.isA(Relationship);
    const entityTargetsRelationship = constraintFunctions.poolTargetsPool(ENTITY_POOL, "a", getTargetPoolName(0));

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isARelationship);
    constraintFunctions.poolTargetsPool = test.mock.fn(
      constraintFunctions.poolTargetsPool,
      () => entityTargetsRelationship,
    );

    const expected: Constraints = {
      poolSpecific: {
        ["a"]: [ isARelationship ],
        [ENTITY_POOL]: [],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        entityTargetsRelationship,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard value query with reference name for objects", (test) => {
    // Arrange
    const input = { x: Relationship.as("a").value() } as const;

    const isARelationship = constraintFunctions.isA(Relationship);
    const entityTargetsRelationship = constraintFunctions.poolTargetsPool(ENTITY_POOL, "a", getTargetPoolName(0));

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isARelationship);
    constraintFunctions.poolTargetsPool = test.mock.fn(
      constraintFunctions.poolTargetsPool,
      () => entityTargetsRelationship,
    );

    const expected: Constraints = {
      poolSpecific: {
        ["a"]: [ isARelationship ],
        [ENTITY_POOL]: [],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        entityTargetsRelationship,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard value query with reference source for arrays", (test) => {
    // Arrange
    const input = [ Relationship.on("source").value() ] as const;

    const isARelationship = constraintFunctions.isA(Relationship);
    const entityTargetsRelationship = constraintFunctions.poolTargetsPool(
      "source",
      RELATIONSHIP_POOL,
      getTargetPoolName(0),
    );

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isARelationship);
    constraintFunctions.poolTargetsPool = test.mock.fn(
      constraintFunctions.poolTargetsPool,
      () => entityTargetsRelationship,
    );

    const expected: Constraints = {
      poolSpecific: {
        [RELATIONSHIP_POOL]: [ isARelationship ],
        ["source"]: [],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        entityTargetsRelationship,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard value query with reference source for objects", (test) => {
    // Arrange
    const input = { x: Relationship.on("source").value() } as const;

    const isARelationship = constraintFunctions.isA(Relationship);
    const entityTargetsRelationship = constraintFunctions.poolTargetsPool(
      "source",
      RELATIONSHIP_POOL,
      getTargetPoolName(0),
    );

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isARelationship);
    constraintFunctions.poolTargetsPool = test.mock.fn(
      constraintFunctions.poolTargetsPool,
      () => entityTargetsRelationship,
    );

    const expected: Constraints = {
      poolSpecific: {
        [RELATIONSHIP_POOL]: [ isARelationship ],
        ["source"]: [],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        entityTargetsRelationship,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard value query with entity source for arrays", (test) => {
    // Arrange
    const entity = new Entity();
    const input = [ Relationship.on(entity).value() ] as const;

    const isARelationship = constraintFunctions.isA(Relationship);
    const isEntity = constraintFunctions.is(entity);
    const entityTargetsRelationship = constraintFunctions.poolTargetsPool(
      getInstancePoolName(entity),
      RELATIONSHIP_POOL,
      getTargetPoolName(0),
    );

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isARelationship);
    constraintFunctions.is = test.mock.fn(constraintFunctions.is, () => isEntity);
    constraintFunctions.poolTargetsPool = test.mock.fn(
      constraintFunctions.poolTargetsPool,
      () => entityTargetsRelationship,
    );

    const expected: Constraints = {
      poolSpecific: {
        [RELATIONSHIP_POOL]: [ isARelationship ],
        [getInstancePoolName(entity)]: [ isEntity ],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        entityTargetsRelationship,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard value query with entity source for objects", (test) => {
    // Arrange
    const entity = new Entity();
    const input = { x: Relationship.on(entity).value() } as const;

    const isARelationship = constraintFunctions.isA(Relationship);
    const isEntity = constraintFunctions.is(entity);
    const entityTargetsRelationship = constraintFunctions.poolTargetsPool(
      getInstancePoolName(entity),
      RELATIONSHIP_POOL,
      getTargetPoolName(0),
    );

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isARelationship);
    constraintFunctions.is = test.mock.fn(constraintFunctions.is, () => isEntity);
    constraintFunctions.poolTargetsPool = test.mock.fn(
      constraintFunctions.poolTargetsPool,
      () => entityTargetsRelationship,
    );

    const expected: Constraints = {
      poolSpecific: {
        [RELATIONSHIP_POOL]: [ isARelationship ],
        [getInstancePoolName(entity)]: [ isEntity ],
        [getTargetPoolName(0)]: [],
      },
      crossPool: [
        entityTargetsRelationship,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard value query with reference target for arrays", (test) => {
    // Arrange
    const input = [ Relationship.to("target").value() ] as const;

    const isARelationship = constraintFunctions.isA(Relationship);
    const entityTargetsRelationship = constraintFunctions.poolTargetsPool(ENTITY_POOL, RELATIONSHIP_POOL, "target");

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isARelationship);
    constraintFunctions.poolTargetsPool = test.mock.fn(
      constraintFunctions.poolTargetsPool,
      () => entityTargetsRelationship,
    );

    const expected: Constraints = {
      poolSpecific: {
        [RELATIONSHIP_POOL]: [ isARelationship ],
        [ENTITY_POOL]: [],
        ["target"]: [],
      },
      crossPool: [
        entityTargetsRelationship,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard value query with reference target for objects", (test) => {
    // Arrange
    const input = { x: Relationship.to("target").value() } as const;

    const isARelationship = constraintFunctions.isA(Relationship);
    const entityTargetsRelationship = constraintFunctions.poolTargetsPool(ENTITY_POOL, RELATIONSHIP_POOL, "target");

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isARelationship);
    constraintFunctions.poolTargetsPool = test.mock.fn(
      constraintFunctions.poolTargetsPool,
      () => entityTargetsRelationship,
    );

    const expected: Constraints = {
      poolSpecific: {
        [RELATIONSHIP_POOL]: [ isARelationship ],
        [ENTITY_POOL]: [],
        ["target"]: [],
      },
      crossPool: [
        entityTargetsRelationship,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard value query with entity target for arrays", (test) => {
    // Arrange
    const entity = new Entity();
    const input = [ Relationship.to(entity).value() ] as const;

    const isARelationship = constraintFunctions.isA(Relationship);
    const isEntity = constraintFunctions.is(entity);
    const entityTargetsRelationship = constraintFunctions.poolTargetsPool(
      ENTITY_POOL,
      RELATIONSHIP_POOL,
      getInstancePoolName(entity),
    );

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isARelationship);
    constraintFunctions.is = test.mock.fn(constraintFunctions.is, () => isEntity);
    constraintFunctions.poolTargetsPool = test.mock.fn(
      constraintFunctions.poolTargetsPool,
      () => entityTargetsRelationship,
    );

    const expected: Constraints = {
      poolSpecific: {
        [RELATIONSHIP_POOL]: [ isARelationship ],
        [ENTITY_POOL]: [],
        [getInstancePoolName(entity)]: [ isEntity ],
      },
      crossPool: [
        entityTargetsRelationship,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses relationship wildcard value query with entity target for objects", (test) => {
    // Arrange
    const entity = new Entity();
    const input = { x: Relationship.to(entity).value() } as const;

    const isARelationship = constraintFunctions.isA(Relationship);
    const isEntity = constraintFunctions.is(entity);
    const entityTargetsRelationship = constraintFunctions.poolTargetsPool(
      ENTITY_POOL,
      RELATIONSHIP_POOL,
      getInstancePoolName(entity),
    );

    constraintFunctions.isA = test.mock.fn(constraintFunctions.isA, () => isARelationship);
    constraintFunctions.is = test.mock.fn(constraintFunctions.is, () => isEntity);
    constraintFunctions.poolTargetsPool = test.mock.fn(
      constraintFunctions.poolTargetsPool,
      () => entityTargetsRelationship,
    );

    const expected: Constraints = {
      poolSpecific: {
        [RELATIONSHIP_POOL]: [ isARelationship ],
        [ENTITY_POOL]: [],
        [getInstancePoolName(entity)]: [ isEntity ],
      },
      crossPool: [
        entityTargetsRelationship,
      ],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });
});

describe("parseMappers", () => {
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
    const permutation = {
      [COMPONENT_POOL]: component,
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
    const permutation = {
      [COMPONENT_POOL]: component,
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
    const permutation = {
      [RELATIONSHIP_POOL]: relationship,
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
    const permutation = {
      [RELATIONSHIP_POOL]: relationship,
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
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [getInstancePoolName(relationship)]: relationship,
      [ENTITY_POOL]: entity1,
      [getTargetPoolName(0)]: entity2,
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
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [getInstancePoolName(relationship)]: relationship,
      [ENTITY_POOL]: entity1,
      [getTargetPoolName(0)]: entity2,
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

  it("Parses relationship component with entity target for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [getInstancePoolName(relationship.to(entity2))]: relationship.to(entity2),
      [ENTITY_POOL]: entity1,
    };
    const input = [ relationship.to(entity2) ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ value ]);
  });

  it("Parses relationship component with entity target for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(relationship.to(entity2).withValue(value));
    const permutation = {
      [getInstancePoolName(relationship.to(entity2))]: relationship.to(entity2),
      [ENTITY_POOL]: entity1,
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
    const permutation = {
      "a": component,
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
    const permutation = {
      "a": component,
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
    const permutation = {
      [COMPONENT_POOL]: component,
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
    const permutation = {
      [COMPONENT_POOL]: component,
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
    const permutation = {
      "a": relationship,
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
    const permutation = {
      "a": relationship,
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
    const permutation = {
      [RELATIONSHIP_POOL]: relationship,
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
    const permutation = {
      [RELATIONSHIP_POOL]: relationship,
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
      [getInstancePoolName(entity2)]: entity2,
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
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ value ]);
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
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: value });
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
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ value ]);
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
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: value });
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
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ value ]);
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
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: value });
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
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ value ]);
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
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: value });
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
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ value ]);
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
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: value });
  });

  it("Parses relationship wildcard value query for arrays", () => {
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
    const input = [ Relationship.value() ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ value ]);
  });

  it("Parses relationship wildcard value query for objects", () => {
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
    const input = { x: Relationship.value() } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: value });
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
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ value ]);
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
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: value });
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
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ value ]);
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
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: value });
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
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ value ]);
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
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: value });
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
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ value ]);
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
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: value });
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
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ value ]);
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
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: value });
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
      [getInstancePoolName(entity2)]: entity2,
    };
    const input = [ Relationship.to(entity2).value() ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ value ]);
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
      [getInstancePoolName(entity2)]: entity2,
    };
    const input = { x: Relationship.to(entity2).value() } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: value });
  });
});

describe(combineMappers.name, () => {
  it("Combine mappers for object", () => {
    // Arrange
    const entity1 = new Entity("Entity 1");
    const entity2 = new Entity("Entity 2");

    const input = {
      a: Entity.as("c"),
      b: Entity.as("d"),
    } as const;

    const mappers: PermutationMapper<typeof input>[] = [
      (permutation, output) => {
        output.a = permutation.c;
      },
      (permutation, output) => {
        output.b = permutation.d;
      },
    ];

    // Act
    const mapper = combineMappers(input, mappers);
    const output = mapper({
      c: entity1,
      d: entity2,
    });

    // Assert
    assert.deepStrictEqual(output, { a: entity1, b: entity2 });
  });

  it("Combine mappers for array", () => {
    // Arrange
    const entity1 = new Entity("Entity 1");
    const entity2 = new Entity("Entity 2");

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
      a: entity1,
      b: entity2,
    });

    // Assert
    assert.deepStrictEqual(output, [ entity1, entity2 ]);
  });
});

describe(permutePools.name, () => {
  it("Permute pools", () => {
    // Arrange
    const entities1 = [ new Entity("Entity A 0"), new Entity("Entity A 1") ];
    const entities2 = [ new Entity("Entity B 0"), new Entity("Entity B 1") ];
    const pools: Pools = {
      a: () => arrayToGenerator(entities1),
      b: () => arrayToGenerator(entities2),
    };

    // Act
    const result = permutePools(pools);

    // Assert
    assert.deepStrictEqual(
      [ ...result ],
      [
        { a: entities1[0], b: entities2[0] },
        { a: entities1[0], b: entities2[1] },
        { a: entities1[1], b: entities2[0] },
        { a: entities1[1], b: entities2[1] },
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
    const entities1 = [ new Entity("0"), new Entity("1") ];
    const entities2 = [ new Entity("0"), new Entity("1"), new Entity("2") ];

    // Arrange
    const pools: Pools = {
      a: () => arrayToGenerator(entities1),
      b: () => arrayToGenerator(entities2),
    };

    const constraints: Record<string, EntityConstraint[]> = {
      a: [ (entity) => entity.name !== "0" ],
      b: [ (entity) => entity.name !== "1" ],
    };

    // Act
    const result = filterPools(pools, constraints);

    // Assert
    assert.deepStrictEqual(
      [ ...result.a() ],
      [ entities1[1] ],
    );
    assert.deepStrictEqual(
      [ ...result.b() ],
      [ entities2[0], entities2[2] ],
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
