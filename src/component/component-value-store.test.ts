import { describe, it } from "node:test";
import * as assert from "node:assert";
import { Component } from "./component.js";
import { ComponentValueStore } from "./component-value-store.js";

describe(ComponentValueStore.name, () => {
  it("Set and get schemaless component", () => {
    const store = new ComponentValueStore();
    const Tag = new Component();

    store.set(Tag, null);

    assert.deepStrictEqual(store.get(Tag), null);
  });


  it("Set and get schemaless component", () => {
    const store = new ComponentValueStore();
    const Comp = new Component({ value: Number });

    store.set(Comp, { value: 42 });

    assert.deepStrictEqual(store.get(Comp), { value: 42 });
  });


  it("Get non-existent component", () => {
    const store = new ComponentValueStore();
    const Tag = new Component();

    assert.deepStrictEqual(store.get(Tag), undefined);
  });

  it("Delete component", () => {
    const store = new ComponentValueStore();
    const Tag = new Component();

    store.set(Tag, null);
    store.delete(Tag);

    assert.deepStrictEqual(store.get(Tag), undefined);
  });
});
