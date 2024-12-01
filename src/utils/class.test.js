import { describe, it } from "node:test";

/** @import { Class, Instance } from "./class.js"; */

describe("Class", () => {
  it("Defines a class, not an instance", () => {
    class A { a = 0; }
    class B { b = 0; }

    /** @type {Class<A>} */
    const aClass1 = A;

    /** @type {Class<B>} */
    // @ts-expect-error
    const bClass = A;

    /** @type {A} */
    const instance = new aClass1();

    /** @type {Class<A>} */
    // @ts-expect-error
    const aClass2 = instance;
  });
});

describe("Instance", () => {
  it("Defines an instance of a class", () => {
    class A { a = 0; }
    class B { b = 0; }

    /** @type {Instance<Class<A>>} */
    const aInstance1 = new A();

    /** @type {Instance<Class<B>>} */
    // @ts-expect-error
    const bInstance = new A();

    // @ts-expect-error
    /** @type {Instance<A>} */
    const instance = new A();
  });
});