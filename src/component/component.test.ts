import { describe, it, } from "node:test";
import * as assert from "node:assert";
import { Component, type ComponentValue, } from "./component.ts";
import { Entity } from "../entity/index.ts";
import { Relationship } from "../relationship/index.ts";

describe(Component.name, () => {
  it("Create component without a name", () => {
    const TestComponent = new Component();

    assert.strictEqual(TestComponent.name, undefined);
  });

  it("Create component with a name", () => {
    const TestComponent = new Component("TestComponent");

    assert.strictEqual(TestComponent.name, "TestComponent");
  });

  it("Component with no value type has undefined value", () => {
    const TestComponent = new Component();

    const rightValue: ComponentValue<typeof TestComponent> = undefined;
    // @ts-expect-error
    const wrongValue: ComponentValue<typeof TestComponent> = 123;
  });

  it("Component with value type has matching value", () => {
    const TestComponent = new Component<number>();

    const rightValue: ComponentValue<typeof TestComponent> = 123;
    // @ts-expect-error
    const wrongValue1: ComponentValue<typeof TestComponent> = "hello";
    // @ts-expect-error
    const wrongValue2: ComponentValue<typeof TestComponent> = undefined;
  });
});

describe(Component.prototype.withValue.name, () => {
  it("Create component values pair", () => {
    const component = new Component<number>();
    const value = 42;

    const pair = component.withValue(value);

    assert.deepStrictEqual(pair, [component, value]);
  });
});

describe(Component.prototype.destroy.name, () => {
  it("Destroy component", () => {
    const component = new Component();

    component.destroy();
  });
});

describe(Component.prototype.on.name, () => {
  it("Create component instance query with entity as source", () => {
    const component = new Component();
    const entity = new Entity();

    const query = component.on(entity);

    assert.strictEqual(query.source, entity);
    assert.strictEqual(query.entity, component);
  });

  it("Create component instance query with reference name as source", () => {
    const component = new Component();

    const query = component.on("source");

    assert.strictEqual(query.source, "source");
    assert.strictEqual(query.entity, component);
  });

  it("Create component instance query with Entity wildcard as source", () => {
    const component = new Component();
    const query = component.on(Entity);

    assert.strictEqual(query.source, Entity);
  });

  it("Create component instance query with Component wildcard as source", () => {
    const component = new Component();
    const query = component.on(Component);

    assert.strictEqual(query.source, Component);
  });

  it("Create component instance query with Relationship wildcard as source", () => {
    const component = new Component();
    const query = component.on(Relationship);

    assert.strictEqual(query.source, Relationship);
  });
});

describe(Component.as.name, () => {
  it("Create component wildcard query with reference name", () => {});
});

describe(Component.once.name, () => {
  it("Create component once query with reference name", () => {});
});

describe(Component.on.name, () => {
  it("Create component wildcard query with entity as source", () => {
    const entity = new Entity();
    const query = Component.on(entity);

    assert.strictEqual(query.source, entity);
  });

  it("Create component wildcard query with reference name as source", () => {
    const query = Component.on("source");

    assert.strictEqual(query.source, "source");
  });

  it("Create component wildcard query with Entity wildcard as source", () => {
    const query = Component.on(Entity);

    assert.strictEqual(query.source, Entity);
  });

  it("Create component wildcard query with Component wildcard as source", () => {
    const query = Component.on(Component);

    assert.strictEqual(query.source, Component);
  });

  it("Create component wildcard query with Relationship wildcard as source", () => {
    const query = Component.on(Relationship);

    assert.strictEqual(query.source, Relationship);
  });
});