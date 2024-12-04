import { describe, it } from "node:test";
import * as assert from "node:assert";
import { Entity } from "./entity.js";
import {
  Component,
} from "../component/index.js";
import { Relationship } from "../relationship/index.js";

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

    const tagValue = entity.__components.get(TestTag);
    assert.strictEqual(tagValue, null);
  });

  it("Add value component to entity", () => {
    const entity = new Entity();
    const TestComponent = new Component({ value: Number });

    entity.add(TestComponent.with({ value: 42 }));

    const componentValue = entity.__components.get(TestComponent);
    assert.deepStrictEqual(componentValue, { value: 42 });
  });

  it("Add multiple components to entity", () => {
    const entity = new Entity();
    const Tag1 = new Component();
    const Tag2 = new Component();

    entity.add(Tag1, Tag2);

    assert.strictEqual(entity.__components.get(Tag1), null);
    assert.strictEqual(entity.__components.get(Tag2), null);
  });

  it("Add existing component to entity", () => {
    const entity = new Entity();
    const TestComponent = new Component({ value: Number });
    entity.add(TestComponent.with({ value: 1 }));

    entity.add(TestComponent.with({ value: 2 }));

    const componentValue = entity.__components.get(TestComponent);
    assert.deepStrictEqual(componentValue, { value: 2 });
    assert.strictEqual([...entity.__components].length, 1);
  });
});

describe(Entity.prototype.remove.name, () => {
  it("Remove component from entity", () => {
    const entity = new Entity();
    const TestTag = new Component();
    entity.__components.set(TestTag, null);

    entity.remove(TestTag);

    const tagValue = entity.__components.get(TestTag);
    assert.strictEqual(tagValue, undefined);
  });

  it("Remove multiple components from entity", () => {
    const entity = new Entity();
    const Tag1 = new Component();
    const Tag2 = new Component();
    entity.__components.set(Tag1, null);
    entity.__components.set(Tag2, null);

    entity.remove(Tag1, Tag2);

    assert.strictEqual(entity.__components.get(Tag1), undefined);
    assert.strictEqual(entity.__components.get(Tag2), undefined);
  });

  it("Remove non-existent component from entity", () => {
    const entity = new Entity();
    const TestTag = new Component();

    entity.remove(TestTag);

    const tagValue = entity.__components.get(TestTag);
    assert.strictEqual(tagValue, undefined);
  });
});

describe(Entity.as.name, () => {
  it("Create entity query", () => {
    const query = Entity.as("entity");
    assert.strictEqual(query.name, "entity");
  });
});


describe(Entity.prototype.get.name, () => {
  it("Get no components", () => {
    const entity = new Entity();
    const TestTag = new Component();
    entity.add(TestTag);

    const components = entity.get();

    assert.deepStrictEqual(components, []);
  });

  it("Get one component", () => {
    const entity = new Entity();
    const TestComponent = new Component({ value: Number });
    entity.add(TestComponent.with({ value: 42 }));

    const [component] = entity.get(TestComponent);

    assert.deepStrictEqual(
      component,
      { value: 42 }
    );
  });

  it("Get multiple components by rest parameters", () => {
    const entity = new Entity();
    const TestComponent1 = new Component({ value: Number });
    const TestComponent2 = new Component({ value: String });
    entity.add(
      TestComponent1.with({ value: 42 }),
      TestComponent2.with({ value: "42" })
    );

    const components = entity.get(TestComponent1, TestComponent2);

    assert.deepStrictEqual(
      components,
      [{ value: 42 }, { value: "42" }]
    );
  });

  it("Get multiple components by object", () => {
    const entity = new Entity();
    const TestComponent1 = new Component({ value: Number });
    const TestComponent2 = new Component({ value: String });
    entity.add(
      TestComponent1.with({ value: 42 }),
      TestComponent2.with({ value: "42" })
    );

    const components = entity.get({
      one: TestComponent1,
      two: TestComponent2,
    });

    assert.deepStrictEqual(
      components,
      { one: { value: 42 }, two: { value: "42" } }
    );
  });

  it("Cannot get tag components", () => {
    const entity = new Entity();
    const TestTag = new Component();
    entity.add(TestTag);

    // @ts-expect-error
    entity.get(TestTag);
    // @ts-expect-error
    entity.get({ tag: TestTag });
    // @ts-expect-error
    entity.get(TestTag, TestTag);
  });

  it("Get non-existent component", () => {
    const entity = new Entity();
    const TestComponent = new Component({ value: Number });

    const [component] = entity.get(TestComponent);

    assert.deepStrictEqual(component, undefined);
  });

  it("Get non-existent components by rest parameters", () => {
    const entity = new Entity();
    const TestComponent = new Component({ value: Number });

    const components = entity.get(TestComponent, TestComponent);

    assert.deepStrictEqual(components, [undefined, undefined]);
  });

  it("Get relationship", () => {
    const entity = new Entity();
    const TestRelationship = new Relationship({ value: Number });
    entity.add(TestRelationship.to(entity).with({ value: 42 }));

    const [component] = entity.get(TestRelationship.to(entity));

    assert.deepStrictEqual(
      component,
      { value: 42 }
    );
  });

  // TODO: More complex queries
});

describe(Entity.prototype.has.name, () => {
  it("Has one component", () => {
    const entity = new Entity();
    const TestComponent = new Component({ value: Number });
    entity.add(TestComponent.with({ value: 42 }));

    const hasComponents = entity.has(TestComponent);

    assert.strictEqual(hasComponents, true);
  });

  it("Has multiple components by rest parameters", () => {
    const entity = new Entity();
    const TestComponent1 = new Component({ value: Number });
    const TestComponent2 = new Component({ value: String });
    entity.add(
      TestComponent1.with({ value: 42 }),
      TestComponent2.with({ value: "42" })
    );

    const hasComponents = entity.has(TestComponent1, TestComponent2);

    assert.strictEqual(hasComponents, true);
  });

  it("Has multiple components by object", () => {
    const entity = new Entity();
    const TestComponent1 = new Component({ value: Number });
    const TestComponent2 = new Component({ value: String });
    entity.add(
      TestComponent1.with({ value: 42 }),
      TestComponent2.with({ value: "42" })
    );

    const hasComponents = entity.has({
      one: TestComponent1,
      two: TestComponent2,
    });

    assert.strictEqual(hasComponents, true);
  });

  it("Has tag components", () => {
    const entity = new Entity();
    const TestTag = new Component();
    entity.add(TestTag);

    const hasComponents = entity.has(TestTag);

    assert.strictEqual(hasComponents, true);
  });

  it("Has non-existent component", () => {
    const entity = new Entity();
    const TestComponent = new Component({ value: Number });

    const hasComponents = entity.has(TestComponent);

    assert.strictEqual(hasComponents, false);
  });

  it("Has non-existent components by rest parameters", () => {
    const entity = new Entity();
    const TestComponent = new Component({ value: Number });

    const hasComponents = entity.has(TestComponent, TestComponent);

    assert.strictEqual(hasComponents, false);
  });

  it("Has relationship", () => {
    const entity = new Entity();
    const TestRelationship = new Relationship({ value: Number });
    entity.add(TestRelationship.to(entity).with({ value: 42 }));

    const hasComponents = entity.has(TestRelationship.to(entity));

    assert.strictEqual(hasComponents, true);
  });

  it("Cannot check if has no amount of components", () => {
    const entity = new Entity();

    // @ts-expect-error
    entity.has();
  });

  // TODO: More complex queries
});

describe(Entity.prototype.destroy.name, () => {
  it("Destroy entity", () => {
    const entity = new Entity();
    const TestTag = new Component();
    entity.__components.set(TestTag, null);

    entity.destroy();

    const components = [...entity.__components];
    assert.deepStrictEqual(components, []);
  });
});
