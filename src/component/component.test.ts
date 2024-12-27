import {
  describe,
  it,
} from "node:test";
import * as assert from "node:assert";
import {
  Component,
  type ComponentValue,
  type ComponentValuePair,
} from "./component.ts";
import { Entity } from "../entity/index.ts";
import { Relationship } from "../relationship/index.ts";
import type { ComponentWildcardQuery } from "./queries/component-wildcard-query.js";
import type { ComponentInstanceQuery } from "./queries/component-instance-query.js";
import { ComponentWildcardValueQuery } from "./queries/component-wildcard-value-query.js";

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

    const pair: ComponentValuePair = component.withValue(value);

    assert.deepStrictEqual(pair, [ component, value ]);
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

    const query: ComponentInstanceQuery<typeof component> = component.on(entity);

    assert.strictEqual(query.source, entity);
    assert.strictEqual(query.component, component);
  });

  it("Create component instance query with reference name as source", () => {
    const component = new Component();

    const query: ComponentInstanceQuery<typeof component> = component.on("source");

    assert.strictEqual(query.source, "source");
    assert.strictEqual(query.component, component);
  });
});

describe(Component.as.name, () => {
  it("Create component wildcard query with reference name", () => {
    const query: ComponentWildcardQuery = Component.as("source");

    assert.strictEqual(query.source, "source");
  });
});

describe(Component.once.name, () => {
  it("Create component once query with reference name", () => {
    const query: ComponentWildcardQuery = Component.once();

    assert.strictEqual(query.once, true);
  });
});

describe(Component.on.name, () => {
  it("Create component wildcard query with entity as source", () => {
    const entity = new Entity();

    const query: ComponentWildcardQuery = Component.on(entity);

    assert.strictEqual(query.source, entity);
  });

  it("Create component wildcard query with reference name as source", () => {
    const query: ComponentWildcardQuery = Component.on("source");

    assert.strictEqual(query.source, "source");
  });
});

describe(Component.value.name, () => {
  it("Create component wildcard value query with reference name first", () => {
    const query: ComponentWildcardValueQuery = Component.as("ref").value();

    assert.strictEqual(query.typeName, "ref");
  });

  it("Create component wildcard value query with reference name last", () => {
    const query: ComponentWildcardValueQuery = Component.value().as("ref");

    assert.strictEqual(query.typeName, "ref");
  });
});
