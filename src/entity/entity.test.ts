import { describe, it, } from "node:test";
import * as assert from "node:assert";
import { Entity } from "./entity.ts";
import { Component, } from "../component/index.ts";
import { Relationship } from "../relationship/index.ts";

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
    assert.strictEqual(tagValue, undefined);
  });

  it("Add value component to entity", () => {
    const entity = new Entity();
    const TestComponent = new Component<number>();

    entity.add(TestComponent.withValue(42));

    const componentValue = entity.__components.get(TestComponent);
    assert.deepStrictEqual(componentValue, 42);
  });

  it("Add multiple components to entity", () => {
    const entity = new Entity();
    const Tag1 = new Component();
    const Tag2 = new Component();

    entity.add(Tag1, Tag2);

    assert.strictEqual(entity.__components.get(Tag1), undefined);
    assert.strictEqual(entity.__components.get(Tag2), undefined);
  });

  it("Add existing component to entity", () => {
    const entity = new Entity();
    const TestComponent = new Component<number>();
    entity.add(TestComponent.withValue(1));

    entity.add(TestComponent.withValue(2));

    const componentValue = entity.__components.get(TestComponent);
    assert.deepStrictEqual(componentValue, 2);
    assert.strictEqual([...entity.__components].length, 1);
  });
});

describe(Entity.prototype.remove.name, () => {
  it("Remove tag component from entity", () => {
    const entity = new Entity();
    const TestTag = new Component();
    entity.__components.set(TestTag);

    const tagBefore = entity.__components.get(TestTag);
    entity.remove(TestTag);
    const tagAfter = entity.__components.get(TestTag);

    assert.strictEqual(tagBefore, undefined);
    assert.strictEqual(tagAfter, null);
  });
  it("Remove value component from entity", () => {
    const entity = new Entity();
    const TestTag = new Component<number>();
    entity.__components.set(TestTag, 42);

    const tagBefore = entity.__components.get(TestTag);
    entity.remove(TestTag);
    const tagAfter = entity.__components.get(TestTag);

    assert.strictEqual(tagBefore, 42);
    assert.strictEqual(tagAfter, null);
  });

  it("Remove multiple components from entity", () => {
    const entity = new Entity();
    const Tag1 = new Component();
    const Tag2 = new Component();
    entity.__components.set(Tag1);
    entity.__components.set(Tag2);

    const tag1Before = entity.__components.get(Tag1);
    const tag2Before = entity.__components.get(Tag2);
    entity.remove(Tag1, Tag2);
    const tag1After = entity.__components.get(Tag1);
    const tag2After = entity.__components.get(Tag2);

    assert.strictEqual(tag1Before, undefined);
    assert.strictEqual(tag2Before, undefined);
    assert.strictEqual(tag1After, null);
    assert.strictEqual(tag2After, null);
  });

  it("Remove non-existent component from entity", () => {
    const entity = new Entity();
    const TestTag = new Component();

    const tagBefore = entity.__components.get(TestTag);
    entity.remove(TestTag);
    const tagAfter = entity.__components.get(TestTag);

    assert.strictEqual(tagBefore, null);
    assert.strictEqual(tagAfter, null);
  });
});

describe(Entity.prototype.get.name, () => {
  it("Cannot get no components", () => {
    const entity = new Entity();

    try {
      // @ts-expect-error
      entity.get()
    } catch {
    }
  });

  it("Get one component", () => {
    const entity = new Entity();
    const TestComponent = new Component<number>();
    entity.add(TestComponent.withValue(42));

    const component = entity.get(TestComponent);

    assert.deepStrictEqual(
      component,
      42,
    );
  });

  it("Get multiple components by rest parameters", () => {
    const entity = new Entity();
    const TestComponent1 = new Component<number>();
    const TestComponent2 = new Component<string>();
    entity.add(
      TestComponent1.withValue(42),
      TestComponent2.withValue("42"),
    );

    const components = entity.get([TestComponent1, TestComponent2]);

    assert.deepStrictEqual(
      components,
      [42, "42"],
    );
  });

  it("Get multiple components by object", () => {
    const entity = new Entity();
    const TestComponent1 = new Component<number>();
    const TestComponent2 = new Component<string>();
    entity.add(
      TestComponent1.withValue(42),
      TestComponent2.withValue("42"),
    );

    const components = entity.get({
      one: TestComponent1,
      two: TestComponent2,
    });

    assert.deepStrictEqual(
      components,
      { one: 42, two: "42" },
    );
  });

  it("Can get tag components", () => {
    const entity = new Entity();
    const TestTag = new Component();
    entity.add(TestTag);

    assert.deepStrictEqual(entity.get(TestTag), undefined);
    assert.deepStrictEqual(entity.get({ tag: TestTag }), { tag: undefined });
    assert.deepStrictEqual(entity.get([TestTag, TestTag]), [undefined, undefined]);
  });

  it("Get non-existent component", () => {
    const entity = new Entity();
    const TestComponent = new Component<number>();

    const component = entity.get(TestComponent);

    assert.deepStrictEqual(component, null);
  });

  it("Get non-existent components by array", () => {
    const entity = new Entity();
    const TestComponent = new Component<number>();

    const components = entity.get([TestComponent, TestComponent]);

    assert.deepStrictEqual(components, [null, null]);
  });

  it("Get non-existent components by object", () => {
    const entity = new Entity();
    const TestComponent = new Component<number>();

    const components = entity.get({ one: TestComponent, two: TestComponent });

    assert.deepStrictEqual(components, { one: null, two: null });
  });

  it("Get relationship component", () => {
    const entity = new Entity();
    const TestRelationship = new Relationship<number>();
    entity.add(TestRelationship.to(entity).withValue(42));

    const component = entity.get(TestRelationship.to(entity));

    assert.deepStrictEqual(
      component,
      42,
    );
  });
});

describe(Entity.prototype.has.name, () => {
  it("Has one component", () => {
    const entity = new Entity();
    const TestComponent = new Component<number>();
    entity.add(TestComponent.withValue(42));

    const hasComponents = entity.has(TestComponent);

    assert.strictEqual(hasComponents, true);
  });

  it("Has multiple components by rest parameters", () => {
    const entity = new Entity();
    const TestComponent1 = new Component<number>();
    const TestComponent2 = new Component<string>();
    entity.add(
      TestComponent1.withValue(42),
      TestComponent2.withValue("42"),
    );

    const hasComponents = entity.has([TestComponent1, TestComponent2]);

    assert.strictEqual(hasComponents, true);
  });

  it("Has multiple components by object", () => {
    const entity = new Entity();
    const TestComponent1 = new Component<number>();
    const TestComponent2 = new Component<string>();
    entity.add(
      TestComponent1.withValue(42),
      TestComponent2.withValue("42"),
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

  it("Does not have non-existent component", () => {
    const entity = new Entity();
    const TestComponent = new Component<number>();

    const hasComponents = entity.has(TestComponent);

    assert.strictEqual(hasComponents, false);
  });

  it("Does not have non-existent components by array", () => {
    const entity = new Entity();
    const TestComponent = new Component<number>();

    const hasComponents = entity.has([TestComponent, TestComponent]);

    assert.strictEqual(hasComponents, false);
  });

  it("Does not have non-existent components by object", () => {
    const entity = new Entity();
    const TestComponent = new Component<number>();

    const hasComponents = entity.has({ one: TestComponent, two: TestComponent });

    assert.strictEqual(hasComponents, false);
  });

  it("Has relationship", () => {
    const entity = new Entity();
    const TestRelationship = new Relationship<number>();
    entity.add(TestRelationship.to(entity).withValue(42));

    const hasComponents = entity.has(TestRelationship.to(entity));

    assert.strictEqual(hasComponents, true);
  });
});

describe(Entity.prototype.destroy.name, () => {
  it("Destroy entity", () => {
    const entity = new Entity();
    const TestTag = new Component();
    entity.__components.set(TestTag);

    entity.destroy();

    const components = [...entity.__components];
    assert.deepStrictEqual(components, []);
  });
});

describe(Entity.as.name, () => {
  it("Create entity wildcard query with reference name", () => {});
});

describe(Entity.once.name, () => {
  it("Create entity once query with reference name", () => {});
});

describe(Entity.type.name, () => {
  it("Create entity type query", () => {});

  it("Create entity type query with reference name", () => {});

  it("Create entity type query with isOnce set to true", () => {});
});