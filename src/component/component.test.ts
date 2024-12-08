import {
  describe,
  it,
} from "node:test";
import * as assert from "node:assert";
import { Component } from "./component.ts";
import { Entity } from "../entity/index.ts";
import {
  type ComponentValue,
  Schema,
} from "./schema.ts";

describe(Component.name, () => {
  it("Create component without name and without schema", () => {
    const TestComponent = new Component();

    assert.strictEqual(TestComponent.name, undefined);
    assert.deepStrictEqual(TestComponent.schema, undefined);
  });

  it("Create component with name and without schema", () => {
    const TestComponent = new Component("TestComponent");

    assert.strictEqual(TestComponent.name, "TestComponent");
    assert.deepStrictEqual(TestComponent.schema, undefined);
  });

  it("Create component without name and with schema", () => {
    const schema = new Schema({ value: 0 });

    const TestComponent = new Component(schema);

    assert.strictEqual(TestComponent.name, undefined);
    assert.deepStrictEqual(TestComponent.schema, schema);
  });

  it("Create component with name and with schema", () => {
    const schema = new Schema({ value: 0 });
    const component = new Component("component", schema);

    assert.strictEqual(component.name, "component");
    assert.deepStrictEqual(component.schema, schema);
  });

  it("Component with no schema has null value", () => {
    const TestComponent = new Component();

    const rightValue: ComponentValue<typeof TestComponent> = null;
    // @ts-expect-error
    const wrongValue: ComponentValue<typeof TestComponent> = 123;
  });

  it("Component with empty schema has any value", () => {
    const schema = new Schema();
    const TestComponent = new Component(schema);

    const rightValue1: ComponentValue<typeof TestComponent> = 123;
    const rightValue2: ComponentValue<typeof TestComponent> = "hello";
  });

  it("Component with typed schema has matching value", () => {
    const schema = new Schema<number>();
    const TestComponent = new Component(schema);

    const rightValue: ComponentValue<typeof TestComponent> = 123;
    // @ts-expect-error
    const wrongValue: ComponentValue<typeof TestComponent> = "hello";
  });

  it("Component with schema with default value has matching value", () => {
    const schema = new Schema(0);
    const TestComponent = new Component(schema);

    const rightValue: ComponentValue<typeof TestComponent> = 123;
    // @ts-expect-error
    const wrongValue: ComponentValue<typeof TestComponent> = "hello";
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

describe(Component.prototype.with.name, () => {
  it("Create component values pair", () => {
    const schema = new Schema({ value: 0 });
    const component = new Component(schema);
    const values = {value: 42};
    const pair = component.with(values);

    assert.deepStrictEqual(pair, [component, values]);
  });
});

describe(Component.prototype.destroy.name, () => {
  it("Destroy component", () => {
    const component = new Component();
    component.destroy();
  });
});
