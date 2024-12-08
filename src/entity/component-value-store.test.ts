import {
  describe,
  it,
} from "node:test";
import * as assert from "node:assert";
import { ComponentValueStore } from "./component-value-store.ts";
import { Component } from "../component/index.ts";

describe(ComponentValueStore.name, () => {
  it("Set and get schemaless component", () => {
    const store = new ComponentValueStore();
    const Tag = new Component();

    store.set(Tag);

    assert.deepStrictEqual(store.get(Tag), undefined);
  });

  it("Set and get schemaless component", () => {
    const store = new ComponentValueStore();
    const TestComponent = new Component<number>();

    store.set(TestComponent, 42);

    assert.deepStrictEqual(store.get(TestComponent), 42);
  });

  it("Get non-existent component", () => {
    const store = new ComponentValueStore();
    const Tag = new Component();

    assert.deepStrictEqual(store.get(Tag), null);
  });

  it("Delete component", () => {
    const store = new ComponentValueStore();
    const Tag = new Component();

    store.set(Tag);
    store.delete(Tag);

    assert.deepStrictEqual(store.get(Tag), null);
  });

  it("Clear store", () => {
    const store = new ComponentValueStore();
    const Tag = new Component();

    store.set(Tag);
    store.clear();

    assert.deepStrictEqual(store.get(Tag), null);
  });

  it("Iterate over store", () => {
    const store = new ComponentValueStore();
    const Tag1 = new Component();
    const Tag2 = new Component();
    store.set(Tag1);
    store.set(Tag2);

    const tags = [...store];

    assert.deepStrictEqual(tags, [[Tag1, undefined], [Tag2, undefined]]);
  });
});
