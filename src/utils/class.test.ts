import { describe, it, } from "node:test";

import { type Class, type Instance, isClassThatExtends, } from "./class.ts";
import { ok } from "node:assert";

describe("Class", () => {
  it("Defines a class, not an instance", () => {
    class A {
      a = 0;
    }

    class B {
      b = 0;
    }

    const aClass1: Class<A> = A;

    // @ts-expect-error
    const bClass: Class<B> = A;

    const instance: A = new aClass1();

    // @ts-expect-error
    const aClass2: Class<A> = instance;
  });
});

describe("Instance", () => {
  it("Defines an instance of a class", () => {
    class A {
      a = 0;
    }

    class B {
      b = 0;
    }

    const aInstance1: Instance<Class<A>> = new A();

    // @ts-expect-error
    const bInstance: Instance<Class<B>> = new A();

    // @ts-expect-error
    const instance: Instance<A> = new A();
  });
});

describe("isClassThatExtends", () => {
  it("Returns true if class is a sub-class of other class", () => {
    // Arrange
    class A {}
    class B extends A {}

    // Act
    const result = isClassThatExtends(B, A);

    // Assert
    ok(result);
  });

  it("Returns true if class is the same as other class", () => {
    // Arrange
    class A {}

    // Act
    const result = isClassThatExtends(A, A);

    // Assert
    ok(result);
  });

  it("Returns false if class is not a sub-class of other class", () => {
    // Arrange
    class A {}
    class B {}

    // Act
    const result = isClassThatExtends(B, A);

    // Assert
    ok(!result);
  });

  it("Returns false if class is a super class of other class", () => {
    // Arrange
    class A {}
    class B extends A {}

    // Act
    const result = isClassThatExtends(A, B);

    // Assert
    ok(!result);
  });
});