import { describe, it, } from "node:test";

import type { Class, Instance, } from "./class.ts";

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
