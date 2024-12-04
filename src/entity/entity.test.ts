import { describe, it } from "node:test";
import * as assert from "node:assert";
import { Entity } from "./entity.js";
import {
  Component,
} from "../component/index.js";

describe(Entity.name, () => {
  it("Create entity without name", () => {
    const entity = new Entity();
    assert.strictEqual(entity.name, undefined);
  });

  it("Create entity with name", () => {
    const entity = new Entity("entity");
    assert.strictEqual(entity.name, "entity");
  });
});

describe(Entity.prototype.add.name, () => {
  it("Add tag component to entity", () => {
    const entity = new Entity();
    const TestTag = new Component();

    entity.add(TestTag);

    const tagValue = entity.components.get(TestTag);
    assert.strictEqual(tagValue, null);
  });

  it("Add value component to entity", () => {
    const entity = new Entity();
    const TestComponent = new Component({
      value: Number,
    });

    entity.add(TestComponent.with({ value: 42 }));

    const componentValue = entity.components.get(TestComponent);
    assert.deepStrictEqual(componentValue, { value: 42 });
  });

  it("Add multiple components to entity", () => {
    const entity = new Entity();
    const Tag1 = new Component();
    const Tag2 = new Component();

    entity.add(Tag1, Tag2);

    assert.strictEqual(entity.components.get(Tag1), null);
    assert.strictEqual(entity.components.get(Tag2), null);
  });
});

describe(Entity.prototype.remove.name, () => {
  it("Remove component from entity", () => {
    const entity = new Entity();
    const TestTag = new Component();
    entity.components.set(TestTag, null);

    entity.remove(TestTag);

    const tagValue = entity.components.get(TestTag);
    assert.strictEqual(tagValue, undefined);
  });

  it("Remove multiple components from entity", () => {
    const entity = new Entity();
    const Tag1 = new Component();
    const Tag2 = new Component();
    entity.components.set(Tag1, null);
    entity.components.set(Tag2, null);

    entity.remove(Tag1, Tag2);

    assert.strictEqual(entity.components.get(Tag1), undefined);
    assert.strictEqual(entity.components.get(Tag2), undefined);
  });
});

describe(Entity.as.name, () => {
  it("Create entity query", () => {
    const query = Entity.as("entity");
    assert.strictEqual(query.name, "entity");
  });
});
