import { describe, it, } from "node:test";
import type { Brand } from "./brand.ts";
import { brand } from "./brand.ts";

describe("Brand", () => {
  it("Makes branded type assignable", () => {
    type A = Brand<number, "A">;

    const a: A = brand(1);
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
