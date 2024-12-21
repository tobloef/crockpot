import { describe, it } from "node:test";
import * as assert from "node:assert";
import {
  combineMappers,
  filterGenerator,
  filterPools,
  parseConstraints,
  parseInput,
  parseMappers,
  parsePools,
  permutePools,
} from "./pools.ts";
import type { Pools, Constraint, Mapper } from "./pools.ts";
import { Entity } from "../entity/index.ts";

describe(parseInput.name, () => {

});

describe(parsePools.name, () => {

});

describe(parseConstraints.name, () => {

});

describe(parseMappers.name, () => {

});

describe(combineMappers.name, () => {
  it("Combine mappers for object", () => {
    // Arrange
    const input = {};

    const mappers: Mapper<Record<string, any>>[] = [
      (permutation, output) => {
        output["a"] = permutation.a.name;
      },
      (permutation, output) => {
        output["b"] = permutation.b.name;
      },
    ];

    // Act
    const result = combineMappers(input, mappers);

    // Assert
    const output = result({ a: new Entity("Entity A"), b: new Entity("Entity B") });
    assert.deepStrictEqual(output, { a: "Entity A", b: "Entity B" });
  });

  it("Combine mappers for array", () => {
    // Arrange
    const input: any[] = [];

    const mappers: Mapper<any[]>[] = [
      (permutation, output) => {
        output.push(permutation.a.name);
      },
      (permutation, output) => {
        output.push(permutation.b.name);
      },
    ];

    // Act
    const result = combineMappers(input, mappers);

    // Assert
    const output = result({ a: new Entity("Entity A"), b: new Entity("Entity B") });
    assert.deepStrictEqual(output, ["Entity A", "Entity B"]);
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