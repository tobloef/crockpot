import {
  describe,
  it,
} from "node:test";
import * as assert from "node:assert";
import {
  combineMappers,
  type Constraint,
  type Constraints,
  DEFAULT_COMPONENT_POOL,
  DEFAULT_ENTITY_POOL,
  DEFAULT_RELATIONSHIP_POOL,
  filterGenerator,
  filterPools,
  has,
  is,
  isComponent,
  isRelationship,
  type Mapper,
  parseConstraints,
  parseInput,
  parseMappers,
  parsePools,
  permutePools,
  type Pools,
} from "./pools.ts";
import { Entity } from "../entity/index.ts";
import type { QueryOutputItem } from "./output.ts";
import { Component } from "../component/index.ts";
import { Relationship } from "../relationship/index.ts";

describe(parseInput.name, () => {

});

describe(parsePools.name, () => {
  it("Parses entity class for arrays", () => {
    // Arrange
    const input = [ Entity ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ DEFAULT_ENTITY_POOL ]);
  });

  it("Parses entity class for objects", () => {
    // Arrange
    const input = { x: Entity } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ DEFAULT_ENTITY_POOL ]);
  });

  it("Parses component class for arrays", () => {
    // Arrange
    const input = [ Component ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ DEFAULT_COMPONENT_POOL, DEFAULT_ENTITY_POOL ]);
  });

  it("Parses component class for objects", () => {
    // Arrange
    const input = { x: Component } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ DEFAULT_COMPONENT_POOL, DEFAULT_ENTITY_POOL ]);
  });

  it("Parses relationship class for arrays", () => {
    // Arrange
    const input = [ Relationship ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ DEFAULT_RELATIONSHIP_POOL, DEFAULT_ENTITY_POOL ]);
  });

  it("Parses relationship class for objects", () => {
    // Arrange
    const input = { x: Relationship } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ DEFAULT_RELATIONSHIP_POOL, DEFAULT_ENTITY_POOL ]);
  });

  it("Parses entity instance for arrays", () => {
    // Arrange
    const entity = new Entity();
    const input = [ entity ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ DEFAULT_ENTITY_POOL ]);
  });

  it("Parses entity instance for objects", () => {
    // Arrange
    const entity = new Entity();
    const input = { x: entity } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ DEFAULT_ENTITY_POOL ]);
  });

  it("Parses component instance for arrays", () => {
    // Arrange
    const component = new Component<number>();
    const input = [ component ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ DEFAULT_COMPONENT_POOL, DEFAULT_ENTITY_POOL ]);
  });

  it("Parses component instance for objects", () => {
    // Arrange
    const component = new Component<number>();
    const input = { x: component } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ DEFAULT_COMPONENT_POOL, DEFAULT_ENTITY_POOL ]);
  });

  it("Parses relationship instance for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const input = [ relationship ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ DEFAULT_RELATIONSHIP_POOL, DEFAULT_ENTITY_POOL ]);
  });

  it("Parses relationship instance for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const input = { x: relationship } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ DEFAULT_RELATIONSHIP_POOL, DEFAULT_ENTITY_POOL ]);
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
    assert.deepStrictEqual(Object.keys(pools), [ DEFAULT_ENTITY_POOL ]);
  });

  it("Parses entity wildcard with once clause for objects", () => {
    // Arrange
    const input = { x: Entity.once() } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ DEFAULT_ENTITY_POOL ]);
  });

  it("Parses component wildcard with reference name for arrays", () => {
    // Arrange
    const input = [ Component.as("a") ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ "a", DEFAULT_ENTITY_POOL ]);
  });

  it("Parses component wildcard with reference name for objects", () => {
    // Arrange
    const input = { x: Component.as("a") } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ "a", DEFAULT_ENTITY_POOL ]);
  });

  it("Parses component wildcard with once clause for arrays", () => {
    // Arrange
    const input = [ Component.once() ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ DEFAULT_COMPONENT_POOL, DEFAULT_ENTITY_POOL ]);
  });

  it("Parses component wildcard with once clause for objects", () => {
    // Arrange
    const input = { x: Component.once() } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ DEFAULT_COMPONENT_POOL, DEFAULT_ENTITY_POOL ]);
  });

  it("Parses component wildcard with source for arrays", () => {
    // Arrange
    const input = [ Component.on("source") ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ DEFAULT_COMPONENT_POOL, "source" ]);
  });

  it("Parses component wildcard with source for objects", () => {
    // Arrange
    const input = { x: Component.on("source") } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ DEFAULT_COMPONENT_POOL, "source" ]);
  });

  it("Parses relationship wildcard with reference name for arrays", () => {
    // Arrange
    const input = [ Relationship.as("a") ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ "a", DEFAULT_ENTITY_POOL ]);
  });

  it("Parses relationship wildcard with reference name for objects", () => {
    // Arrange
    const input = { x: Relationship.as("a") } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ "a", DEFAULT_ENTITY_POOL ]);
  });

  it("Parses relationship wildcard with once clause for arrays", () => {
    // Arrange
    const input = [ Relationship.once() ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ DEFAULT_RELATIONSHIP_POOL, DEFAULT_ENTITY_POOL ]);
  });

  it("Parses relationship wildcard with once clause for objects", () => {
    // Arrange
    const input = { x: Relationship.once() } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ DEFAULT_RELATIONSHIP_POOL, DEFAULT_ENTITY_POOL ]);
  });

  it("Parses relationship wildcard with source for arrays", () => {
    // Arrange
    const input = [ Relationship.on("source") ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ DEFAULT_RELATIONSHIP_POOL, "source" ]);
  });

  it("Parses relationship wildcard with source for objects", () => {
    // Arrange
    const input = { x: Relationship.on("source") } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ DEFAULT_RELATIONSHIP_POOL, "source" ]);
  });

  it("Parses relationship wildcard with target for arrays", () => {
    // Arrange
    const input = [ Relationship.to("target") ] as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ DEFAULT_RELATIONSHIP_POOL, DEFAULT_ENTITY_POOL, "target" ]);
  });

  it("Parses relationship wildcard with target for objects", () => {
    // Arrange
    const input = { x: Relationship.to("target") } as const;

    // Act
    const pools = parsePools(input);

    // Assert
    assert.deepStrictEqual(Object.keys(pools), [ DEFAULT_RELATIONSHIP_POOL, DEFAULT_ENTITY_POOL, "target" ]);
  });
});

describe(parseConstraints.name, () => {
  it("Parses entity class for arrays", () => {
    // Arrange
    const input = [ Entity ] as const;
    const expected: Constraints = {
      poolSpecific: {},
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
      poolSpecific: {},
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
        [DEFAULT_COMPONENT_POOL]: [ isComponent ],
      },
      crossPool: [],
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
        [DEFAULT_COMPONENT_POOL]: [ isComponent ],
      },
      crossPool: [],
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
        [DEFAULT_RELATIONSHIP_POOL]: [ isRelationship ],
      },
      crossPool: [],
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
        [DEFAULT_RELATIONSHIP_POOL]: [ isRelationship ],
      },
      crossPool: [],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses entity instance for arrays", () => {
    // Arrange
    const entity = new Entity();
    const input = [ entity ] as const;
    const expected: Constraints = {
      poolSpecific: {
        [DEFAULT_ENTITY_POOL]: [ is(entity) ],
      },
      crossPool: [],
    };

    // Act
    const actual = parseConstraints(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });

  it("Parses entity instance for objects", () => {
    // Arrange
    const entity = new Entity();
    const input = { x: entity } as const;
    const expected: Constraints = {
      poolSpecific: {
        [DEFAULT_ENTITY_POOL]: [ is(entity) ],
      },
      crossPool: [],
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
        [DEFAULT_COMPONENT_POOL]: [ is(component) ],
        [DEFAULT_ENTITY_POOL]: [ has(component) ],
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
        [DEFAULT_COMPONENT_POOL]: [ is(component) ],
        [DEFAULT_ENTITY_POOL]: [ has(component) ],
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
        [DEFAULT_RELATIONSHIP_POOL]: [ is(relationship) ],
        [DEFAULT_ENTITY_POOL]: [ has(relationship) ],
      },
      crossPool: [],
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
      [DEFAULT_ENTITY_POOL]: entity,
    };
    const input = [ Entity ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ DEFAULT_COMPONENT_POOL ]);
  });

  it("Parses entity class for objects", () => {
    // Arrange
    const entity = new Entity();
    const permutation = {
      [DEFAULT_ENTITY_POOL]: entity,
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
      [DEFAULT_ENTITY_POOL]: entity,
      [DEFAULT_COMPONENT_POOL]: component,
    };
    const input = [ Component ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ value ]);
  });

  it("Parses component class for objects", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      [DEFAULT_ENTITY_POOL]: entity,
      [DEFAULT_COMPONENT_POOL]: component,
    };
    const input = { x: Component } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: value });
  });

  it("Parses relationship class for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity = new Entity();
    entity.add(relationship.to(relationship).withValue(value));
    const permutation = {
      [DEFAULT_ENTITY_POOL]: entity,
      [DEFAULT_RELATIONSHIP_POOL]: relationship,
    };
    const input = [ Relationship ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ value ]);
  });

  it("Parses relationship class for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity = new Entity();
    entity.add(relationship.to(relationship).withValue(value));
    const permutation = {
      [DEFAULT_ENTITY_POOL]: entity,
      [DEFAULT_RELATIONSHIP_POOL]: relationship,
    };
    const input = { x: Relationship } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: value });
  });

  it("Parses entity instance for arrays", () => {
    // Arrange
    const entity = new Entity();
    const permutation = {
      [DEFAULT_ENTITY_POOL]: entity,
    };
    const input = [ entity ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ entity ]);
  });

  it("Parses entity instance for objects", () => {
    // Arrange
    const entity = new Entity();
    const permutation = {
      [DEFAULT_ENTITY_POOL]: entity,
    };
    const input = { x: entity } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: entity });
  });

  it("Parses component instance for arrays", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      [DEFAULT_ENTITY_POOL]: entity,
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
      [DEFAULT_ENTITY_POOL]: entity,
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
      [DEFAULT_ENTITY_POOL]: entity,
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
      [DEFAULT_ENTITY_POOL]: entity,
    };
    const input = { x: relationship } as const;
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
      [DEFAULT_ENTITY_POOL]: entity,
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
      [DEFAULT_ENTITY_POOL]: entity,
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
      "a": entity,
    };
    const input = [ Component.as("a") ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ value ]);
  });

  it("Parses component wildcard with reference name for objects", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      "a": entity,
    };
    const input = { x: Component.as("a") } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: value });
  });

  it("Parses component wildcard with once clause for arrays", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      [DEFAULT_ENTITY_POOL]: entity,
    };
    const input = [ Component.once() ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ value ]);
  });

  it("Parses component wildcard with once clause for objects", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      [DEFAULT_ENTITY_POOL]: entity,
    };
    const input = { x: Component.once() } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: value });
  });

  it("Parses component wildcard with source for arrays", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      "source": entity,
    };
    const input = [ Component.on("source") ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ value ]);
  });

  it("Parses component wildcard with source for objects", () => {
    // Arrange
    const component = new Component<number>();
    const value = 1;
    const entity = new Entity().add(component.withValue(value));
    const permutation = {
      "source": entity,
    };
    const input = { x: Component.on("source") } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: value });
  });

  it("Parses relationship wildcard with reference name for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity = new Entity();
    entity.add(relationship.to(relationship).withValue(value));
    const permutation = {
      "a": entity,
    };
    const input = [ Relationship.as("a") ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ value ]);
  });

  it("Parses relationship wildcard with reference name for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity = new Entity();
    entity.add(relationship.to(relationship).withValue(value));
    const permutation = {
      "a": entity,
    };
    const input = { x: Relationship.as("a") } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: value });
  });

  it("Parses relationship wildcard with once clause for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity = new Entity();
    entity.add(relationship.to(relationship).withValue(value));
    const permutation = {
      [DEFAULT_ENTITY_POOL]: entity,
    };
    const input = [ Relationship.once() ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ value ]);
  });

  it("Parses relationship wildcard with once clause for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity = new Entity();
    entity.add(relationship.to(relationship).withValue(value));
    const permutation = {
      [DEFAULT_ENTITY_POOL]: entity,
    };
    const input = { x: Relationship.once() } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: value });
  });

  it("Parses relationship wildcard with source for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity = new Entity();
    entity.add(relationship.to(relationship).withValue(value));
    const permutation = {
      "source": entity,
    };
    const input = [ Relationship.on("source") ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ value ]);
  });

  it("Parses relationship wildcard with source for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity = new Entity();
    entity.add(relationship.to(relationship).withValue(value));
    const permutation = {
      "source": entity,
    };
    const input = { x: Relationship.on("source") } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: value });
  });

  it("Parses relationship wildcard with target for arrays", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity = new Entity();
    entity.add(relationship.to(relationship).withValue(value));
    const permutation = {
      [DEFAULT_ENTITY_POOL]: entity,
    };
    const input = [ Relationship.to("target") ] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [ mapper ] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [ value ]);
  });

  it("Parses relationship wildcard with target for objects", () => {
    // Arrange
    const relationship = new Relationship<number>();
    const value = 1;
    const entity = new Entity();
    entity.add(relationship.to(relationship).withValue(value));
    const permutation = {
      [DEFAULT_ENTITY_POOL]: entity,
    };
    const input = { x: Relationship.to("target") } as const;
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
    const input = {
      a: Entity.as("c"),
      b: Entity.as("d"),
    } as const;

    const mappers: Mapper<typeof input>[] = [
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

    const mappers: Mapper<typeof input>[] = [
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

    const constraints: Record<string, Constraint[]> = {
      a: [ (permutation) => permutation.a.name !== "Entity 0" ],
      b: [ (permutation) => permutation.b.name !== "Entity 1" ],
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

    const constraints: Record<string, Constraint[]> = {};

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
