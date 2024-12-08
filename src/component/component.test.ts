import {
  describe,
  it,
} from "node:test";
import * as assert from "node:assert";
import { Component } from "./component.ts";
import { Entity } from "../entity/index.ts";
import { Schema } from "./schema.js";

describe(Component.name, () => {
  it("Create component without name and without schema", () => {
    const component = new Component();

    assert.strictEqual(component.name, undefined);
    assert.deepStrictEqual(component.schema, undefined);
  });

  it("Create component with name and without schema", () => {
    const component = new Component("component");

    assert.strictEqual(component.name, "component");

    assert.deepStrictEqual(component.schema, undefined);
  });

  it("Create component without name and with schema", () => {
    const schema = new Schema({ value: 0 });
    const component = new Component(schema);

    assert.strictEqual(component.name, undefined);
    assert.deepStrictEqual(component.schema, schema);
  });

  it("Create component with name and with schema", () => {
    const schema = new Schema({ value: 0 });
    const component = new Component("component", schema);

    assert.strictEqual(component.name, "component");
    assert.deepStrictEqual(component.schema, schema);
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
