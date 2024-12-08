import {
  describe,
  it,
} from "node:test";
import * as assert from "node:assert";
import {
  Component,
  type ComponentValue,
} from "./component.ts";
import { Entity } from "../entity/index.ts";

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

describe(Component.prototype.on.name, () => {
  it("Create component query with entity as source", () => {
    const component = new Component();
    const entity = new Entity();

    const query = component.on(entity);

    assert.strictEqual(query.source, entity);
    assert.strictEqual(query.component, component);
  });

  it("Create component query with reference name as source", () => {
    const component = new Component();

    const query = component.on("source");

    assert.strictEqual(query.source, "source");
    assert.strictEqual(query.component, component);
  });
});

describe(Component.prototype.as.name, () => {
  it("Create component query reference name", () => {
    const component = new Component();

    const query = component.as("name");

    assert.strictEqual(query.name, "name");
    assert.strictEqual(query.component, component);
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
