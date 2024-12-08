import {
  describe,
  it,
} from "node:test";
import { Schema } from "./schema.ts";
import * as assert from "node:assert";

describe(Schema.name, () => {
  it("Create schema with default value", () => {
    const schema = new Schema({ value: 0 });

    assert.deepStrictEqual(schema.defaultValue, { value: 0 });
  });

  it("Create schema without default value", () => {
    const schema = new Schema();

    assert.deepStrictEqual(schema.defaultValue, undefined);
  });
});
