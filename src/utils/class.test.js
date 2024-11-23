import { describe, it } from "node:test";
import * as assert from "node:assert";
import { createNamedClass, makeClassCallable } from "./class.js";

describe(makeClassCallable.name, () => {
  it("should return a callable class", () => {
    class TestClass {
      static staticField = "staticField";

      constructor() {
        this.field = "field";
      }

      method() {
        return this.field;
      }
    }

    TestClass.someProp = "someProp";

    function testCallable() {
      return "callable";
    }

    const callableClass = makeClassCallable(TestClass, testCallable);

    const instance = new callableClass();

    assert.strictEqual(instance.method(), "field");
    assert.strictEqual(instance.constructor.name, TestClass.name);
    assert.strictEqual(callableClass.staticField, "staticField");
    assert.strictEqual(callableClass.someProp, "someProp");
    assert.strictEqual(callableClass(), "callable");
    assert.strictEqual(callableClass.name, TestClass.name);
    assert.deepEqual(Object.keys(callableClass), Object.keys(TestClass));
  })
})

describe(createNamedClass.name, () => {
  it("should return a named class", () => {
    const name = "TestNamedClass";

    const Class = createNamedClass(name);

    const instance = new Class();

    assert.strictEqual(Class.name, name);
    assert.strictEqual(instance.constructor.name, name);
  });
});