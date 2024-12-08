import {
  describe,
  it,
} from "node:test";
import { Relationship } from "./relationship.ts";
import * as assert from "node:assert";
import { Entity } from "../entity/index.ts";
import { Any } from "../query/index.ts";

describe(Relationship.name, () => {
  it("Create relationship without name and without schema", () => {
    const TestRelationship = new Relationship();

    assert.strictEqual(TestRelationship.name, undefined);
    assert.deepStrictEqual(TestRelationship.schema, undefined);
  });

  it("Create relationship with name and without schema", () => {
    const name = "relationship";

    const TestRelationship = new Relationship(name);

    assert.strictEqual(TestRelationship.name, name);
    assert.deepStrictEqual(TestRelationship.schema, undefined);
  });

  it("Create relationship without name and with schema", () => {
    const schema = { value: Number };

    const TestRelationship = new Relationship(schema);

    assert.strictEqual(TestRelationship.name, undefined);
    assert.deepStrictEqual(TestRelationship.schema, schema);
  });

  it("Create relationship with name and with schema", () => {
    const name = "relationship";
    const schema = { value: Number };

    const TestRelationship = new Relationship(name, schema);

    assert.strictEqual(TestRelationship.name, name);
    assert.deepStrictEqual(TestRelationship.schema, schema);
  });
});

describe(Relationship.prototype.to.name, () => {
  it("Create relationship component to entity for schemaless relationship", () => {
    const TestRelationship = new Relationship();
    const entity = new Entity();

    const component = TestRelationship.to(entity);

    assert.strictEqual(component.schema, TestRelationship.schema);
  });

  it("Create relationship component to entity for relationship with values", () => {
    const schema = { value: Number };
    const TestRelationship = new Relationship(schema);
    const entity = new Entity();

    const component = TestRelationship.to(entity);

    assert.strictEqual(component.schema, TestRelationship.schema);
  });

  it("Created relationship component has name based on relationship and target", () => {
    assert.strictEqual(
      new Relationship().to(new Entity()).name,
      undefined,
    );
    assert.strictEqual(
      new Relationship().to(new Entity("entity")).name,
      "?->entity",
    );
    assert.strictEqual(
      new Relationship("relationship").to(new Entity()).name,
      "relationship->?",
    );
    assert.strictEqual(
      new Relationship("relationship").to(new Entity("entity")).name,
      "relationship->entity",
    );
  });

  it("Create relationship query with reference name as target", () => {
    const TestRelationship = new Relationship();
    const query = TestRelationship.to("target");

    assert.strictEqual(query.target, "target");
    assert.strictEqual(query.relationship, TestRelationship);
  });

  it("Create relationship query with wildcard as target", () => {
    const TestRelationship = new Relationship();
    const query = TestRelationship.to(Any);

    assert.strictEqual(query.target, Any);
    assert.strictEqual(query.relationship, TestRelationship);
  });
});

describe(Relationship.prototype.on.name, () => {
  it("Create relationship query with entity as source", () => {
    const TestRelationship = new Relationship();
    const entity = new Entity();
    const query = TestRelationship.on(entity);

    assert.strictEqual(query.source, entity);
    assert.strictEqual(query.relationship, TestRelationship);
  });

  it("Create relationship query with reference name as source", () => {
    const TestRelationship = new Relationship();
    const query = TestRelationship.on("source");

    assert.strictEqual(query.source, "source");
    assert.strictEqual(query.relationship, TestRelationship);
  });
});

describe(Relationship.prototype.as.name, () => {
  it("Create relationship query reference name", () => {
    const TestRelationship = new Relationship();
    const query = TestRelationship.as("name");

    assert.strictEqual(query.name, "name");
    assert.strictEqual(query.relationship, TestRelationship);
  });
});

describe(Relationship.prototype.destroy.name, () => {
  it("Destroy relationship", () => {
    const TestRelationship = new Relationship();
    const entity = new Entity();
    entity.add(TestRelationship.to(entity));

    TestRelationship.destroy();

    assert.strictEqual(
      Relationship.__relationshipComponents.get(TestRelationship, entity),
      undefined,
    );
  });
});
