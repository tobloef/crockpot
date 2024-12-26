import {
  describe,
  it,
} from "node:test";
import * as assert from "node:assert";
import { RelationshipComponentStore } from "./relationship-component-store.ts";
import { Relationship } from "./relationship.ts";
import { Entity } from "../entity/index.ts";
import { Component } from "../component/index.ts";

describe(RelationshipComponentStore.name, () => {
  it("Stores and retrieves components by schemaless relationship and entity", () => {
    const store = new RelationshipComponentStore();
    const TestRelationship = new Relationship();
    const entity = new Entity();
    const component = new Component();

    store.set(TestRelationship, entity, component);

    assert.strictEqual(store.get(TestRelationship, entity), component);
  });

  it("Stores and retrieves components by schema relationship and entity", () => {
    const store = new RelationshipComponentStore();
    const TestRelationship = new Relationship<number>();
    const entity = new Entity();
    const component = new Component<number>();

    store.set(TestRelationship, entity, component);

    assert.strictEqual(store.get(TestRelationship, entity), component);
  });

  it("Does not store component with schema different from relationship", () => {
    const store = new RelationshipComponentStore();
    const TestRelationship = new Relationship<number>();
    const entity = new Entity();
    const component = new Component<string>();

    // @ts-expect-error
    store.set(TestRelationship, entity, component);
  });

  it("Returns null for non-existent component", () => {
    const store = new RelationshipComponentStore();

    const TestRelationship = new Relationship();
    const entity = new Entity();

    assert.strictEqual(store.get(TestRelationship, entity), null);
  });
});
