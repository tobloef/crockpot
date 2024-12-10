import {
  describe,
  it,
} from "node:test";
import { query } from "./query.ts";
import { Entity } from "../entity/index.ts";
import * as assert from "node:assert";
import {
  Component,
} from "../component/index.ts";
import { Relationship } from "../relationship/index.js";
import { Any } from "./wildcard.js";
import { not } from "./boolean/index.js";

const TagComponent1 = new Component();
const TagComponent2 = new Component();
const StringComponent1 = new Component<string>();
const NumberComponent1 = new Component<number>();
const NumberComponent2 = new Component<number>();
const TagRelationship1 = new Relationship();
const TagRelationship2 = new Relationship();
const NumberRelationship1 = new Relationship<number>();
const NumberRelationship2 = new Relationship<number>();

describe(query.name, () => {
  it("Finds nothing when input is empty array", () => {
    const entities = [
      new Entity(),
      new Entity(),
      new Entity(),
    ];

    const result = query(entities, []);

    assert.deepStrictEqual(result, []);
  });

  it("Finds nothing when input is empty object", () => {
    const entities = [
      new Entity(),
      new Entity(),
      new Entity(),
    ];

    const result = query(entities, {});

    assert.deepStrictEqual(result, []);
  });

  it("Finds entities when input is entity", () => {
    const entities = [
      new Entity("First"),
      new Entity("Second"),
      new Entity("Third"),
    ];

    const result = query(entities, [Entity]);

    assert.deepStrictEqual(result, entities);
  });

  it("Finds no entities when entity list is empty", () => {
    const entities: Entity[] = [];

    const result = query(entities, [Entity]);

    assert.deepStrictEqual(result, entities);
  });

  it("Finds entities with specified tag", () => {
    const entities = [
      new Entity().add(TagComponent1),
      new Entity().add(TagComponent2),
      new Entity().add(TagComponent1),
      new Entity().add(),
    ];

    const result = query(entities, [Entity, TagComponent1]);

    assert.deepStrictEqual(result, [
      [entities[0], null],
      [entities[2], null],
    ]);
  });

  it("Finds entities with specified value component", () => {
    const entities = [
      new Entity().add(NumberComponent1.withValue(1)),
      new Entity().add(StringComponent1.withValue("hello")),
      new Entity().add(NumberComponent1.withValue(2)),
      new Entity().add(),
    ];

    const result = query(entities, [Entity, NumberComponent1]);

    assert.deepStrictEqual(result, [
      [entities[0], 1],
      [entities[2], 2],
    ]);
  });

  it("Finds specified components without retrieving entity", () => {
    const entities = [
      new Entity().add(NumberComponent1.withValue(1)),
      new Entity().add(StringComponent1.withValue("hello")),
      new Entity().add(NumberComponent1.withValue(2)),
      new Entity().add(),
    ];

    const result = query(entities, [NumberComponent1]);

    assert.deepStrictEqual(result, [
      [1],
      [2],
    ]);
  });

  it("Finds entities with multiple components", () => {
    const entities = [
      new Entity().add(TagComponent1, NumberComponent1.withValue(1)),
      new Entity().add(TagComponent2, StringComponent1.withValue("hello")),
      new Entity().add(TagComponent2, NumberComponent1.withValue(2)),
      new Entity().add(TagComponent1, NumberComponent1.withValue(3)),
      new Entity().add(),
    ];

    const result = query(entities, [Entity, TagComponent1, NumberComponent1]);

    assert.deepStrictEqual(result, [
      [entities[0], null, 1],
      [entities[3], null, 3],
    ]);
  });

  it("Returns output as object when input is object", () => {
    const entities = [
      new Entity("First").add(NumberComponent1.withValue(1)),
      new Entity("Second"),
      new Entity("Third").add(NumberComponent1.withValue(2)),
    ];

    const result = query(entities, {
      entity: Entity,
      component: NumberComponent1,
    });

    assert.deepStrictEqual(result, [
      { entity: entities[0], component: 1 },
      { entity: entities[2], component: 2 },
    ]);
  });

  it("Finds relationships to other entities", () => {
    const targetEntity1 = new Entity();
    const targetEntity2 = new Entity();
    const entities = [
      targetEntity1,
      targetEntity2,
      new Entity().add(NumberRelationship1.to(targetEntity1).withValue(1)),
      new Entity().add(NumberRelationship2.to(targetEntity1).withValue(2)),
      new Entity().add(NumberRelationship1.to(targetEntity2).withValue(3)),
    ];

    const result = query(entities, [Entity, NumberRelationship1]);

    assert.deepStrictEqual(result, [
      [entities[2], 1],
      [entities[4], 3],
    ]);
  });

  it("Finds relationships to specific entities", () => {
    const targetEntity1 = new Entity();
    const targetEntity2 = new Entity();
    const entities = [
      targetEntity1,
      targetEntity2,
      new Entity().add(NumberRelationship1.to(targetEntity1).withValue(1)),
      new Entity().add(NumberRelationship2.to(targetEntity1).withValue(2)),
      new Entity().add(NumberRelationship1.to(targetEntity2).withValue(3)),
    ];

    const result = query(entities, [Entity, NumberRelationship1.to(targetEntity1)]);

    assert.deepStrictEqual(result, [
      [entities[2], 1],
    ]);
  });

  it("Finds relationships and target entities", () => {
    const targetEntity1 = new Entity();
    const targetEntity2 = new Entity();
    const entities = [
      targetEntity1,
      targetEntity2,
      new Entity().add(NumberRelationship1.to(targetEntity1).withValue(1)),
      new Entity().add(NumberRelationship2.to(targetEntity1).withValue(2)),
      new Entity().add(NumberRelationship1.to(targetEntity2).withValue(3)),
    ];

    const result = query(entities, [Entity, Entity.as("target"), NumberRelationship1.to("target")]);

    assert.deepStrictEqual(result, [
      [entities[2], targetEntity1, 1],
      [entities[4], targetEntity2, 3],
    ]);
  });

  it("Finds implicit relationship to self", () => {
    const entity1 = new Entity();
    entity1.add(TagRelationship1.to(entity1));
    const entities = [
      entity1,
    ];

    const result = query(entities, [
      Entity, TagRelationship1.to("ent"),
    ]);

    assert.deepStrictEqual(result, [
      [entity1, entity1],
    ]);
  });

  it("Finds explicit relationship by reference to self", () => {
    const entity1 = new Entity();
    entity1.add(TagRelationship1.to(entity1));
    const entities = [
      entity1,
    ];

    const result = query(entities, [
      Entity.as("ref"),
      TagRelationship1.to("ent"),
    ]);

    assert.deepStrictEqual(result, [
      [entity1, entity1],
    ]);
  });

  it("Finds target entities with specified components", () => {
    const targetEntity1 = new Entity().add(NumberComponent1.withValue(1));
    const targetEntity2 = new Entity().add(NumberComponent2.withValue(2));
    const entities = [
      targetEntity1,
      targetEntity2,
      new Entity().add(NumberRelationship1.to(targetEntity1).withValue(3)).add(NumberComponent1.withValue(6)),
      new Entity().add(NumberRelationship2.to(targetEntity1).withValue(4)).add(NumberComponent2.withValue(7)),
      new Entity().add(NumberRelationship1.to(targetEntity2).withValue(5)).add(NumberComponent1.withValue(8)),
    ];

    const result = query(entities, [
      Entity.as("target"),
      NumberComponent1.on("target"),
      NumberRelationship1.to("target"),
      NumberComponent1
    ]);

    assert.deepStrictEqual(result, [
      [targetEntity1, 1, 3, 6],
      [targetEntity2, 2, 5, 8],
    ]);
  });

  it("Finds the default entity multiple times", () => {
    const entity1 = new Entity().add(NumberComponent1.withValue(1));
    const entity2 = new Entity().add(NumberComponent1.withValue(2)).add(NumberRelationship1.to(entity1).withValue(3));
    const entities = [
      entity1,
      entity2,
    ];

    const result = query(entities, [
      Entity,
      Entity,
    ]);

    assert.deepStrictEqual(result, [
      [entity1, entity1],
      [entity2, entity2],
    ]);
  });

  it("Finds entity when entity has unused reference name", () => {
    const entity1 = new Entity().add(NumberComponent1.withValue(1));
    const entity2 = new Entity().add(NumberComponent1.withValue(2)).add(NumberRelationship1.to(entity1).withValue(3));
    const entities = [
      entity1,
      entity2,
    ];

    const result = query(entities, [
      Entity.as("ref"),
    ]);

    assert.deepStrictEqual(result, [
      [entity1],
      [entity2],
    ]);
  });

  it("Finds entity multiple times when one of the entities has unused reference name", () => {
    const entity1 = new Entity().add(NumberComponent1.withValue(1));
    const entity2 = new Entity().add(NumberComponent1.withValue(2)).add(NumberRelationship1.to(entity1).withValue(3));
    const entities = [
      entity1,
      entity2,
    ];

    const result = query(entities, [
      Entity,
      Entity.as("ref"),
    ]);

    assert.deepStrictEqual(result, [
      [entity1, entity1],
      [entity2, entity2],
    ]);
  });

  it("Finds entity component is on that references entity", () => {
    const entities = [
      new Entity().add(TagComponent1),
      new Entity().add(TagComponent2),
      new Entity().add(TagComponent1),
    ];

    const result = query(entities, [
      Entity.as("ref"),
      TagComponent1.on("ref"),
    ]);

    assert.deepStrictEqual(result, [
      [entities[0], null],
      [entities[2], null],
    ]);
  });

  it("Finds multiple components on same reference", () => {
    const entities = [
      new Entity(),
      new Entity().add(TagComponent1),
      new Entity().add(TagComponent2),
      new Entity().add(TagComponent1, TagComponent2),
      new Entity().add(TagComponent2, TagComponent1),
    ];

    const result = query(entities, [
      TagComponent1.on("ref"),
      TagComponent2.on("ref"),
    ]);

    assert.deepStrictEqual(result, [
      [null, null],
      [null, null],
    ]);
  });

  it("Finds multiple entities and components with different references", () => {
    const entities = [
      new Entity(),
      new Entity().add(TagComponent1),
      new Entity().add(TagComponent2),
      new Entity().add(TagComponent1, TagComponent2),
      new Entity().add(TagComponent2, TagComponent1),
      new Entity().add(TagComponent2),
    ];

    const result = query(entities, [
      Entity.as("ref1"),
      TagComponent1.on("ref1"),
      Entity.as("ref2"),
      TagComponent2.on("ref2"),
    ]);

    assert.deepStrictEqual(result, [
      [entities[1], null, entities[2], null],
      [entities[2], null, entities[3], null],
      [entities[3], null, entities[3], null],
      [entities[4], null, entities[4], null],
    ]);
  });

  it("Finds entities by wrapping around the list if there are multiple references", () => {
    const entities = [
      new Entity().add(TagComponent1),
      new Entity().add(TagComponent1, TagComponent2),
      new Entity().add(TagComponent2),
    ];

    const result = query(entities, [
      Entity.as("ref1"),
      TagComponent1.on("ref1"),
      Entity.as("ref2"),
      TagComponent2.on("ref2"),
    ]);

    assert.deepStrictEqual(result, [
      [entities[0], null, entities[1], null],
      [entities[1], null, entities[1], null],
      [entities[2], null, entities[1], null],
    ]);
  });

  it("Does not find entity if other entity reference is not found", () => {
    const entities = [
      new Entity().add(TagComponent1),
      new Entity().add(TagComponent1),
    ];

    const result = query(entities, [
      Entity.as("ref1"),
      TagComponent2.on("ref2"),
    ]);

    assert.deepStrictEqual(result, []);
  });

  it("Finds component with specific value", () => {
    const entities = [
      new Entity().add(NumberComponent1.withValue(1)),
      new Entity().add(NumberComponent1.withValue(2)),
      new Entity().add(NumberComponent1.withValue(3)),
    ];

    // TODO: This type is not working
    const result = query(entities, [
      Entity,
      NumberComponent1.withValue(2),
    ]);

    assert.deepStrictEqual(result, [
      [entities[1], 2],
    ]);
  });

  it("Finds tag component with no value", () => {
    const entities = [
      new Entity().add(TagComponent1.withValue(undefined)),
      new Entity().add(TagComponent2.withValue(undefined)),
      new Entity().add(TagComponent1.withValue(undefined)),
    ];

    const result = query(entities, [
      Entity,
      TagComponent1.withValue(undefined),
    ]);

    assert.deepStrictEqual(result, [
      [entities[0], undefined],
      [entities[2], undefined],
    ]);
  });

  it("Find same entity even under different reference names", () => {
    const entities = [
      new Entity().add(NumberComponent1.withValue(1)),
      new Entity().add(NumberComponent1.withValue(2)),
    ];

    const result = query(entities, [
      Entity.as("ref1"),
      Entity.as("ref2"),
    ]);

    assert.deepStrictEqual(result, [
      [entities[0], entities[0]],
      [entities[1], entities[1]],
    ]);
  });

  it("Find an entity that is not the same entity", () => {
    const entities = [
      new Entity().add(NumberComponent1.withValue(1)),
      new Entity().add(NumberComponent1.withValue(2)),
    ];

    const result = query(entities, [
      // TODO: currently not supported
    ]);

    assert.deepStrictEqual(result, [
      [entities[0], 1],
      [entities[1], 2],
    ]);
  });

  it("Finds relationship on referenced entity", () => {
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(TagRelationship1.to(entity2));
    const entities = [
      entity1,
      entity2,
    ];

    const result = query(entities, [
      Entity.as("ref1"),
      TagRelationship1.on("ref1"),
    ]);

    assert.deepStrictEqual(result, [
      [entities[0], null],
    ]);
  });

  it("Finds relationship on specific entity", () => {
    const entity1 = new Entity();
    const entity2 = new Entity();
    const entity3 = new Entity();
    entity1.add(TagRelationship1.to(entity2));
    entity2.add(TagRelationship1.to(entity1));
    entity2.add(TagRelationship1.to(entity3));
    entity3.add(TagRelationship1.to(entity1));
    const entities = [
      entity1,
      entity2,
      entity3,
    ];

    const result = query(entities, [
      Entity.as("ref"),
      TagRelationship1.on(entity2).to("ref"),
    ]);

    assert.deepStrictEqual(result, [
      [entities[0], null],
      [entities[2], null],
    ]);
  });

  it("Finds entity with indirect link to self, despite references under different name", () => {
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(TagRelationship1.to(entity2));
    entity2.add(TagRelationship1.to(entity1));
    const entities = [
      entity1,
      entity2,
    ];

    const result = query(entities, [
      Entity.as("ref1"),
      TagRelationship1.on("ref1").to("ref2"),
      TagRelationship1.on("ref2").to("ref1"),
    ]);

    assert.deepStrictEqual(result, [
      [entities[0], entities[1], entities[0]],
    ]);
  });

  it("Find component on component and entity", () => {
    const Comp1 = new Component<number>();
    const Comp2 = new Component<string>();
    Comp1.add(Comp2.withValue("one"));
    Comp2.add(Comp1.withValue(1));
    const entities = [
      Comp1,
      Comp2,
      new Entity().add(Comp1.withValue(2)),
      new Entity().add(Comp2.withValue("two")),
    ];

    const result = query(entities, [
      Entity,
      Comp1,
    ]);

    assert.deepStrictEqual(result, [
      [entities[0], 1],
      [entities[2], 2],
    ]);
  });

  it("Find component on referenced component", () => {
    const Comp1 = new Component<number>();
    const Comp2 = new Component<string>();
    Comp1.add(Comp2.withValue("one"));
    Comp2.add(Comp1.withValue(1));
    const entities = [
      Comp1,
      Comp2,
      new Entity().add(Comp1.withValue(2)),
      new Entity().add(Comp2.withValue("two")),
    ];

    const result = query(entities, [
      Comp1.as("ref"),
      Comp2.on("ref"),
    ]);

    assert.deepStrictEqual(result, [
      [entities[0], "one"],
    ]);
  });

  it("Find relationships on components", () => {
    const Comp1 = new Component<number>();
    const Comp2 = new Component<string>();
    const Rel1 = new Relationship<number>();
    const Rel2 = new Relationship<string>();
    Comp1.add(Rel1.to(Comp2).withValue(1));
    Comp2.add(Rel1.to(Rel2).withValue(2));
    const entities = [
      Comp1,
      Comp2,
      Rel1,
      Rel2,
    ];

    const result = query(entities, [
      Rel2.on("source").to("target"),
      Entity.as("source"),
      Entity.as("target"),
    ]);

    assert.deepStrictEqual(result, [
      [1, entities[0], entities[1]],
      [2, entities[1], entities[3]],
    ]);
  });

  it("Find relationships on relationships", () => {
    const Comp1 = new Component<number>();
    const Comp2 = new Component<string>();
    const Rel1 = new Relationship<number>();
    const Rel2 = new Relationship<string>();
    Rel1.add(Rel2.to(Comp1).withValue("one"));
    Rel2.add(Rel2.to(Rel1).withValue("two"));
    const entities = [
      Comp1,
      Comp2,
      Rel1,
      Rel2,
    ];

    const result = query(entities, [
      Rel2.on("source").to("target"),
      Entity.as("source"),
      Entity.as("target"),
    ]);

    assert.deepStrictEqual(result, [
      ["one", entities[2], entities[0]],
      ["two", entities[3], entities[2]],
    ]);
  });

  it("Finds relationship component", () => {
    const entity = new Entity();
    const relComp = NumberRelationship1.to(entity);
    entity.add(relComp.withValue(1));
    const entities = [
      NumberRelationship1,
      relComp,
      entity,
    ];

    const result = query(entities, [
      NumberRelationship1.on("source").to("target").as("rel"),
      Entity.as("rel"),
    ]);

    assert.deepStrictEqual(result, [
      [2, relComp],
    ]);
  });

  it("Finds relationship on referenced relationship component", () => {
    const entity1 = new Entity();
    const entity2 = new Entity();
    const relComp = NumberRelationship1.to(entity2);
    entity1.add(relComp.withValue(1));
    relComp.add(NumberRelationship2.to(entity1).withValue(2));
    entity2.add(NumberRelationship2.to(entity1).withValue(3));
    const entities = [
      NumberRelationship1,
      NumberRelationship2,
      relComp,
      entity1,
      entity2,
    ];

    const result = query(entities, [
      NumberRelationship1.on("source").to("target1").as("rel"),
      NumberRelationship2.on("rel").to("target2"),
      Entity.as("source"),
      Entity.as("target1"),
      Entity.as("target2"),
      Entity.as("rel"),
    ]);

    assert.deepStrictEqual(result, [
      [1, 2, entity1, entity2, entity1, relComp],
    ]);
  });
});

// TODO: Wildcards (including referencing them)
// TODO: Boolean queries (perhaps check out the existing tests to figure out some funky edge cases)
// TODO: Assert types in the tests (many are wrong)
