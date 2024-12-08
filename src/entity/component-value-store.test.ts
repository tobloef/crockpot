import {
  describe,
  it,
} from "node:test";
import * as assert from "node:assert";
import { Component } from "../component/component.ts";
import { ComponentValueStore } from "./component-value-store.ts";

describe(ComponentValueStore.name, () => {
  it("Set and get schemaless component", () => {
    const store = new ComponentValueStore();
    const Tag = new Component();

    store.set(Tag, null);

    assert.deepStrictEqual(store.get(Tag), null);
  });

  it("Set and get schemaless component", () => {
    const store = new ComponentValueStore();
    const Comp = new Component({value: Number});

    store.set(Comp, {value: 42});

    assert.deepStrictEqual(store.get(Comp), {value: 42});
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

  it("Clear store", () => {
    const store = new ComponentValueStore();
    const Tag = new Component();

    store.set(Tag, null);
    store.clear();

    assert.deepStrictEqual(store.get(Tag), undefined);
  });

  it("Iterate over store", () => {
    const store = new ComponentValueStore();
    const Tag1 = new Component();
    const Tag2 = new Component();

    store.set(Tag1, null);
    store.set(Tag2, null);

    const tags = [...store];
    assert.deepStrictEqual(tags, [[Tag1, null], [Tag2, null]]);
  });
});
