import { describe, it } from "node:test";
import { Node, Edge } from "./index.ts";
import { parseInput } from "./query/parse-input.ts";

describe("test", () => {
  it("should pass", () => {
    class N1 extends Node {}
    class N2 extends Node {}

    const parsed1 = parseInput(N1.with(Edge.to(N2)));
    const parsed2 = parseInput(N1.with(Edge.from(N2)));
    const parsed3 = parseInput(N1.with(Edge.fromOrTo(N2)));
    const parsed4 = parseInput(N1.to(N2));
    const parsed5 = parseInput(N1.from(N2));
    const parsed6 = parseInput(N1.fromOrTo(N2));

    console.log("break!")
  });
})