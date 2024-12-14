import {
  describe,
  it,
} from "node:test";
import {
  Relationship,
  type RelationshipValue
} from "./relationship.ts";
import * as assert from "node:assert";
import { Entity } from "../entity/index.ts";
import {
  Component,
  type ComponentValue
} from "../component/index.ts";
import {
  assertTypesEqual,
} from "../utils/type-assertions.ts";

describe(Relationship.name, () => {
  it("Create relationship without name", () => {
    const TestRelationship = new Relationship();

    assert.strictEqual(TestRelationship.name, undefined);
  });

  it("Create relationship with name", () => {
    const name = "TestRelationship";

    const TestRelationship = new Relationship(name);

    assert.strictEqual(TestRelationship.name, name);
  });

  it("Relationship with no value type has undefined value", () => {
    const TestRelationship = new Relationship();

    const rightValue: RelationshipValue<typeof TestRelationship> = undefined;
    // @ts-expect-error
    const wrongValue: RelationshipValue<typeof TestRelationship> = 123;
  });

  it("Relationship with value type has matching value", () => {
    const TestRelationship= new Relationship<number>();

    const rightValue: RelationshipValue<typeof TestRelationship> = 123;
    // @ts-expect-error
    const wrongValue1: RelationshipValue<typeof TestRelationship> = "hello";
    // @ts-expect-error
    const wrongValue2: RelationshipValue<typeof TestRelationship> = undefined;
  });
});

describe(Relationship.prototype.as.name, () => {
  it("Create relationship query with reference name", () => {
    const TestRelationship = new Relationship();
    const query = TestRelationship.as("name");

    assert.strictEqual(query.name, "name");
    assert.strictEqual(query.relationship, TestRelationship);
  });
});

describe(Relationship.prototype.once.name, () => {
  it("Create relationship query with isOnce", () => {
    const relationship = new Relationship();

    const query = relationship.once();

    assert.strictEqual(query.isOnce, true);
  });

  it("isOnce is false by default", () => {
    const relationship = new Relationship();

    const query = relationship.as("");

    assert.strictEqual(query.isOnce, false);
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

  it("Create relationship query with Entity wildcard as source", () => {
    const relationship = new Relationship();
    const query = relationship.on(Entity);

    assert.strictEqual(query.source, Entity);
  });

  it("Create relationship query with Component wildcard as source", () => {
    const relationship = new Relationship();
    const query = relationship.on(Component);

    assert.strictEqual(query.source, Component);
  });

  it("Create relationship query with Relationship wildcard as source", () => {
    const relationship = new Relationship();
    const query = relationship.on(Relationship);

    assert.strictEqual(query.source, Relationship);
  });
});

describe(Relationship.prototype.to.name, () => {
  it("Create relationship component to entity for schemaless relationship", () => {
    const TestRelationship = new Relationship();
    const entity = new Entity();

    const RelationshipComponent = TestRelationship.to(entity);

    type RelationshipValueType = ComponentValue<typeof RelationshipComponent>;
    type RelationshipComponentValueType = RelationshipValue<typeof TestRelationship>;
    assertTypesEqual<RelationshipValueType, RelationshipComponentValueType>(true);
  });

  it("Create relationship component to entity for relationship with values", () => {
    const TestRelationship = new Relationship<number>();
    const entity = new Entity();

    const RelationshipComponent = TestRelationship.to(entity);

    type RelationshipValueType = ComponentValue<typeof RelationshipComponent>;
    type RelationshipComponentValueType = RelationshipValue<typeof TestRelationship>;
    assertTypesEqual<RelationshipValueType, RelationshipComponentValueType>(true);
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

  it("Create relationship query with entity wildcard as target", () => {
    const TestRelationship = new Relationship();
    const query = TestRelationship.to(Entity);

    assert.strictEqual(query.target, Entity);
    assert.strictEqual(query.relationship, TestRelationship);
  });

  it("Create relationship query with component wildcard as target", () => {
    const TestRelationship = new Relationship();
    const query = TestRelationship.to(Component);

    assert.strictEqual(query.target, Entity);
    assert.strictEqual(query.relationship, TestRelationship);
  });

  it("Create relationship query with relationship wildcard as target", () => {
    const TestRelationship = new Relationship();
    const query = TestRelationship.to(Relationship);

    assert.strictEqual(query.target, Entity);
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
      null,
    );
    assert.strictEqual(
      entity.__components.get(TestRelationship.to(entity)),
      null,
    )
  });
});

describe(Relationship.as.name, () => {
  it("Create relationship wildcard query with name", () => {
    const query = Relationship.as("name");

    assert.strictEqual(query.name, "name");
  });
});

describe(Relationship.once.name, () => {
  it("Create relationship wildcard query with isOnce", () => {
    const query = Relationship.once();

    assert.strictEqual(query.isOnce, true);
  });

  it("isOnce is false by default", () => {
    const query = Relationship.as("");

    assert.strictEqual(query.isOnce, false);
  });
});

describe(Relationship.on.name, () => {
  it("Create relationship wildcard query with entity as source", () => {
    const entity = new Entity();
    const query = Relationship.on(entity);

    assert.strictEqual(query.source, entity);
  });

  it("Create relationship wildcard query with reference name as source", () => {
    const query = Relationship.on("source");

    assert.strictEqual(query.source, "source");
  });

  it("Create relationship wildcard query with Entity wildcard as source", () => {
    const query = Relationship.on(Entity);

    assert.strictEqual(query.source, Entity);
  });

  it("Create relationship wildcard query with Component wildcard as source", () => {
    const query = Relationship.on(Component);

    assert.strictEqual(query.source, Component);
  });

  it("Create relationship wildcard query with Relationship wildcard as source", () => {
    const query = Relationship.on(Relationship);

    assert.strictEqual(query.source, Relationship);
  });
});

describe(Relationship.to.name, () => {
  it("Create relationship wildcard query with reference name as target", () => {
    const query = Relationship.to("target");

    assert.strictEqual(query.target, "target");
    assert.strictEqual(query.relationship, Relationship);
  });

  it("Create relationship wildcard query with entity wildcard as target", () => {
    const query = Relationship.to(Entity);

    assert.strictEqual(query.target, Entity);
    assert.strictEqual(query.relationship, Relationship);
  });

  it("Create relationship wildcard query with component wildcard as target", () => {
    const query = Relationship.to(Component);

    assert.strictEqual(query.target, Entity);
    assert.strictEqual(query.relationship, Relationship);
  });

  it("Create relationship wildcard query with relationship wildcard as target", () => {
    const query = Relationship.to(Relationship);

    assert.strictEqual(query.target, Entity);
    assert.strictEqual(query.relationship, Relationship);
  });
});