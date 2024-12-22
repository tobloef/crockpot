import { describe, it } from "node:test";
import * as assert from "node:assert";
import type { Constraint, Mapper, Pools } from "./pools.ts";
import { combineMappers, filterGenerator, filterPools, parseConstraints, parseInput, parseMappers, parsePools, permutePools, } from "./pools.ts";
import { Entity } from "../entity/index.ts";
import type { QueryOutputItem } from "./output";
import { Component } from "../component/index";
import { Relationship } from "../relationship/index";

describe(parseInput.name, () => {

});

describe(parsePools.name, () => {

});

describe(parseConstraints.name, () => {

});

describe(parseMappers.name, () => {
  it("Parses entity class for arrays", () => {
    // Arrange
    const entity = new Entity();
    const permutation = {
      "__default": entity,
    };
    const input = [Entity] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [mapper] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [entity]);
  });

  it("Parses entity class for objects", () => {
    // Arrange
    const entity = new Entity();
    const permutation = {
      "__default": entity,
    };
    const input = { x: Entity } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [mapper] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: entity });
  });

  it("Parses component class for arrays", () => {
    // Arrange
    const component = new Component();
    const permutation = {
      "__default": component,
    };
    const input = [Component] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [mapper] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [component]);
  });

  it("Parses entity class for objects", () => {
    // Arrange
    const component = new Component();
    const permutation = {
      "__default": component,
    };
    const input = { x: Component } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [mapper] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: component });
  });

  it("Parses relationship class for arrays", () => {
    // Arrange
    const relationship = new Relationship();
    const permutation = {
      "__default": relationship,
    };
    const input = [Relationship] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [mapper] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [relationship]);
  });

  it("Parses relationship class for objects", () => {
    // Arrange
    const relationship = new Relationship();
    const permutation = {
      "__default": relationship,
    };
    const input = { x: Relationship } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [mapper] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: relationship });
  });

  it("Parses entity instance for arrays", () => {
    // Arrange
    const entity = new Entity();
    const permutation = {
      "__default": entity,
    };
    const input = [entity] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [mapper] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [entity]);
  });

  it("Parses entity instance for objects", () => {
    // Arrange
    const entity = new Entity();
    const permutation = {
      "__default": entity,
    };
    const input = { x: entity } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [mapper] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: entity });
  });

  it("Parses component instance for arrays", () => {
    // Arrange
    const component = new Component();
    const permutation = {
      "__default": component,
    };
    const input = [component] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [mapper] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [component]);
  });

  it("Parses component instance for objects", () => {
    // Arrange
    const component = new Component();
    const permutation = {
      "__default": component,
    };
    const input = { x: component } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [mapper] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: component });
  });

  it("Parses relationship instance for arrays", () => {
    // Arrange
    const relationship = new Relationship();
    const permutation = {
      "__default": relationship,
    };
    const input = [relationship] as const;
    const output: Partial<QueryOutputItem<typeof input>> = [];

    // Act
    const [mapper] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, [relationship]);
  });

  it("Parses relationship instance for objects", () => {
    // Arrange
    const relationship = new Relationship();
    const permutation = {
      "__default": relationship,
    };
    const input = { x: relationship } as const;
    const output: Partial<QueryOutputItem<typeof input>> = {};

    // Act
    const [mapper] = parseMappers(input);
    mapper(permutation, output);

    // Assert
    assert.deepStrictEqual(output, { x: relationship });
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
    assert.deepStrictEqual(output, ["Entity 1", "Entity 2"]);
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
      [...result],
      [
        { a: new Entity("Entity A 0"), b: new Entity("Entity B 0") },
        { a: new Entity("Entity A 0"), b: new Entity("Entity B 1") },
        { a: new Entity("Entity A 1"), b: new Entity("Entity B 0") },
        { a: new Entity("Entity A 1"), b: new Entity("Entity B 1") },
      ]
    );
  });

  it("Should do nothing with empty pools", () => {
    // Arrange
    const pools: Pools = {};

    // Act
    const result = permutePools(pools);

    // Assert
    assert.deepStrictEqual(
      [...result],
      []
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
      a: [(permutation) => permutation.a.name !== "Entity 0"],
      b: [(permutation) => permutation.b.name !== "Entity 1"],
    };

    // Act
    const result = filterPools(pools, constraints);

    // Assert
    assert.deepStrictEqual(
      [...result.a()],
      [new Entity("Entity 1")]
    );
    assert.deepStrictEqual(
      [...result.b()],
      [new Entity("Entity 0"), new Entity("Entity 2")]
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
      []
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
    assert.deepStrictEqual([...result], [2, 3]);
  });

  it("Should do nothing with empty generator", () => {
    // Arrange
    const generator = function* () {}();

    // Act
    const result = filterGenerator(generator, (value) => value > 1);

    // Assert
    assert.deepStrictEqual([...result], []);
  });
});

function createEntityGenerator(count: number, prefix?: string): Generator<Entity> {
  return function* () {
    for (let i = 0; i < count; i++) {
      yield new Entity(`${prefix ?? "Entity"} ${i}`);
    }
  }();
}