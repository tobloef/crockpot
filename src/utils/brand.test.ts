import { describe, it } from "node:test";
import { brand } from "./brand.js";

import type { Brand } from "./brand.js";

describe("Brand", () => {
  it("Makes branded type assignable", () => {
    type A = Brand<number, "A">;

    /** @type {A} */
    const a = brand(1);
  });

  it("Makes unbranded type unassignable", () => {
    type A = Brand<number, "A">;

    // @ts-expect-error
    const a: A = 1;
  });

  it("Makes equal branded types unassignable", () => {
    type A = Brand<number, "A">;
    type B = Brand<number, "B">;

    const a: A = brand(1);

    // @ts-expect-error
    const b: B = a;
  });
});
