import {
  describe,
  it,
} from "node:test";
import { query } from "./query.ts";
import { Entity } from "../entity/index.ts";
import * as assert from "node:assert";
import {
  Component,
} from "../component/index.ts";

describe(query.name, () => {
  it("Finds nothing when input is empty array", () => {
    const entities = [
      new Entity(),
      new Entity(),
      new Entity(),
    ];

    const result = query(entities, []);

    assert.deepStrictEqual(result, []);
  });

  it("Finds nothing when input is empty object", () => {
    const entities = [
      new Entity(),
      new Entity(),
      new Entity(),
    ];

    const result = query(entities, {});

    assert.deepStrictEqual(result, []);
  });

  it("Finds entities when input is Entity", () => {
    const entities = [
      new Entity("First"),
      new Entity("Second"),
      new Entity("Third"),
    ];

    const result = query(entities, [Entity]);

    assert.deepStrictEqual(result, entities);
  });

  it("Finds no entities when entity list is empty", () => {
    const entities: Entity[] = [];

    const result = query(entities, [Entity]);

    assert.deepStrictEqual(result, entities);
  });

  it("Finds entities with specified tag", () => {
    const Tag1 = new Component();
    const Tag2 = new Component();
    const entities = [
      new Entity().add(Tag1),
      new Entity().add(Tag2),
      new Entity().add(Tag1),
      new Entity().add(),
    ];

    const result = query(entities, [Entity, Tag1]);

    assert.deepStrictEqual(result, [
      [entities[0], null],
      [entities[2], null],
    ]);
  });

  it("Find entities with specified value component", () => {
    const Component1 = new Component<number>();
    const Component2 = new Component<string>();
    const entities = [
      new Entity().add(Component1.withValue(1)),
      new Entity().add(Component2.withValue("hello")),
      new Entity().add(Component1.withValue(2)),
      new Entity().add(),
    ];

    const result = query(entities, [Entity, Component1]);

    assert.deepStrictEqual(result, [
      [entities[0], 1],
      [entities[2], 2],
    ]);
  });

  // TODO: More tests
});
