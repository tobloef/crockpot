import { describe, it } from "node:test";
import { brand } from "./brand.js";

/** @import { Brand } from "./brand.js"; */

describe("Brand", () => {
  it("Makes branded type assignable", () => {
    /** @typedef {Brand<number, "A">} A */

    /** @type {A} */
    const a = brand(1);
  });

  it("Makes unbranded type unassignable", () => {
    /** @typedef {Brand<number, "A">} A */

    /** @type {A} */
    // @ts-expect-error
    const a = 1;
  });

  it("Makes equal branded types unassignable", () => {
    /** @typedef {Brand<number, "A">} A */
    /** @typedef {Brand<number, "B">} B */

    /** @type {A} */
    const a = brand(1);

    /** @type {B} */
    // @ts-expect-error
    const b = a;
  });
});