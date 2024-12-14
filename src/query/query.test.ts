import {
  describe,
  it,
  beforeEach,
} from "node:test";
import { query } from "./query.ts";
import { Entity } from "../entity/index.ts";
import * as assert from "node:assert";
import {
  Component,
} from "../component/index.ts";
import { Relationship } from "../relationship/index.ts";
import { Any } from "./wildcard.ts";
import { assertTypesEqual } from "../utils/type-assertions";
import type { QueryPartOutput } from "./output";

let components: Component<any>[] = [];
let relationships: Relationship<any>[] = [];

let TagComponent1: Component;
let TagComponent2: Component;
let StringComponent1: Component<string>;
let NumberComponent1: Component<number>;
let NumberComponent2: Component<number>;

let TagRelationship1: Relationship;
let TagRelationship2: Relationship;
let NumberRelationship1: Relationship<number>;
let NumberRelationship2: Relationship<number>;

beforeEach(() => {
  setupComponents();
  setupRelationships();
});

describe(query.name, () => {
  it("Finds nothing when input is empty array", () => {
    // Arrange
    const entities = setupEntities({ count: 3, includeComponents: true });

    // Act
    const result = query(entities, []);

    // Assert
    assertTypesEqual<typeof result, []>(true);
    assert.deepStrictEqual(result, []);
  });

  it("Finds nothing when input is empty object", () => {
    // Arrange
    const entities = setupEntities({ count: 3, includeComponents: true });

    // Act
    const result = query(entities, {});

    // Assert
    assertTypesEqual<typeof result, {}>(true);
    assert.deepStrictEqual(result, {});
  });

  it("Finds entities, components, and relationships when querying for Entity", () => {
    // Arrange
    const entities = setupEntities({ count: 3, includeComponents: true });

    // Act
    const test: QueryPartOutput<Entity> = [];

    const result = query(entities, [Entity]);

    // Assert
    assertTypesEqual<typeof result, [Entity]>(true);
    assert.deepStrictEqual(result, entities);
  });

  it("Finds components and relationships when input is Component class", () => {
    const entities = [
      TagComponent1,
      NumberComponent1,
      TagRelationship1,
      NumberRelationship1,
    ];

    const result = query(entities, [
      Component,
    ]);

    assert.deepStrictEqual(result, [
      [TagComponent1],
      [NumberComponent1],
      [TagRelationship1],
      [NumberRelationship1],
    ]);
  });

  it("Finds relationships when input is Relationship class", () => {
    const entities = [
      TagComponent1,
      NumberComponent1,
      TagRelationship1,
      NumberRelationship1,
    ];

    const result = query(entities, [
      Relationship,
    ]);

    assert.deepStrictEqual(result, [
      [TagComponent1],
      [NumberComponent1],
      [TagRelationship1],
      [NumberRelationship1],
    ]);
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
      // TODO: currently not supported. Add a "equals"?
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

  it("Finds relationship on entity to component", () => {
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(NumberRelationship1.to(TagComponent1).withValue(1));
    const entities = [
      NumberRelationship1,
      TagComponent1,
      entity1,
      entity2,
    ];

    const result = query(entities, [
      Entity,
      NumberRelationship1.to(TagComponent1),
    ]);

    assert.deepStrictEqual(result, [
      [entity1, 1],
    ]);
  })

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

  it("Should fetch relationships with Any wildcard", () => {
    const entity1 = new Entity();
    const entity2 = new Entity();
    const entity3 = new Entity();
    const entity4 = new Entity();
    const entity5 = new Entity();
    const entity6 = new Entity();
    const TestComponent = new Component();
    const TestRelationship = new Relationship();
    entity1.add(NumberRelationship1.to(entity6).withValue(1));
    entity2.add(NumberRelationship2.to(entity6).withValue(2));
    entity3.add(NumberRelationship1.to(entity6).withValue(3));
    entity4.add(NumberRelationship1.to(TestComponent).withValue(4));
    entity5.add(NumberRelationship1.to(TestRelationship).withValue(5));
    const entities = [
      entity1,
      entity2,
      entity3,
      entity4,
      entity5,
      entity6,
      TestComponent,
      TestRelationship,
    ];

    const result = query(entities, [
      Entity,
      TagRelationship1.to(Any),
    ]);

    assert.deepStrictEqual(result, [
      [entity1, 1],
      [entity3, 3],
      [entity4, 4],
      [entity5, 5],
    ]);
  });

  it("Reference should work the same as Any wildcard", () => {
    const entity1 = new Entity();
    const entity2 = new Entity();
    const entity3 = new Entity();
    const entity4 = new Entity();
    const entity5 = new Entity();
    const entity6 = new Entity();
    const TestComponent = new Component();
    const TestRelationship = new Relationship();
    entity1.add(NumberRelationship1.to(entity6).withValue(1));
    entity2.add(NumberRelationship2.to(entity6).withValue(2));
    entity3.add(NumberRelationship1.to(entity6).withValue(3));
    entity4.add(NumberRelationship1.to(TestComponent).withValue(4));
    entity5.add(NumberRelationship1.to(TestRelationship).withValue(5));
    const entities = [
      entity1,
      entity2,
      entity3,
      entity4,
      entity5,
      entity6,
      TestComponent,
      TestRelationship,
    ];

    const wildcardResult = query(entities, [Entity, TagRelationship1.to(Any)]);
    const referenceResult = query(entities, [Entity, TagRelationship1.to("ref")]);

    assert.deepStrictEqual(wildcardResult, referenceResult);
  });

  it("Finds just one related entity with Any wildcard", () => {
    const entity1 = new Entity();
    const entity2 = new Entity()
      .add(NumberRelationship1.to(entity1).withValue(1))
      .add(NumberRelationship1.to(entity1).withValue(2));
    const entity3 = new Entity()
      .add(NumberRelationship1.to(entity1).withValue(2))
      .add(NumberRelationship1.to(entity1).withValue(3));
    const entities = [
      entity1,
      entity2,
      entity3,
    ];

    const result = query(entities, [
      Entity,
      TagRelationship1.to(Any)
    ]);

    assert.deepStrictEqual(result, [
      [entity2, 1],
      [entity3, 2],
    ]);
  });

  it("Finds all related entities with All wildcard", () => {
    const entity1 = new Entity();
    const entity2 = new Entity()
      .add(NumberRelationship1.to(entity1).withValue(1))
      .add(NumberRelationship1.to(entity1).withValue(3));
    const entity3 = new Entity()
      .add(NumberRelationship1.to(entity1).withValue(2))
      .add(NumberRelationship1.to(entity1).withValue(4));
    const entities = [
      entity1,
      entity2,
      entity3,
    ];

    const result = query(entities, [
      Entity,
      TagRelationship1.to(All)
    ]);

    assert.deepStrictEqual(result, [
      [entity2, 1],
      [entity2, 3],
      [entity3, 2],
      [entity3, 4],
    ]);
  });

  it("Should fetch all relationships with All wildcard", () => {
    const entity1 = new Entity();
    const entity2 = new Entity();
    const TestComponent = new Component();
    const TestRelationship = new Relationship();
    entity1.add(NumberRelationship1.to(entity2).withValue(1));
    entity1.add(NumberRelationship2.to(entity2).withValue(2));
    entity1.add(NumberRelationship1.to(entity2).withValue(3));
    entity1.add(NumberRelationship1.to(TestComponent).withValue(4));
    entity1.add(NumberRelationship1.to(TestRelationship).withValue(5));
    const entities = [
      entity1,
      entity2,
      TestComponent,
      TestRelationship,
    ];

    const result = query(entities, [
      Entity,
      TagRelationship1.to(Any),
    ]);

    assert.deepStrictEqual(result, [
      [entity1, 1],
      [entity1, 3],
      [entity1, 4],
      [entity1, 5],
    ]);
  });

  it("Wildcards should be referencable", () => {
    const entity1 = new Entity();
    const entity2 = new Entity();
    const TestComponent = new Component();
    const TestRelationship = new Relationship();
    entity1.add(NumberRelationship1.to(entity2).withValue(1));
    entity1.add(NumberRelationship2.to(entity2).withValue(2));
    entity1.add(NumberRelationship1.to(entity2).withValue(3));
    entity1.add(NumberRelationship1.to(TestComponent).withValue(4));
    entity1.add(NumberRelationship1.to(TestRelationship).withValue(5));
    const entities = [
      entity1,
      entity2,
      TestComponent,
      TestRelationship,
    ];

    const result = query(entities, [
      Entity,
      TagRelationship1.to(All.as("wild")),
      Entity.as("wild"),
    ]);

    assert.deepStrictEqual(result, [
      [entity1, 1, entity2],
      [entity1, 3, entity2],
      [entity1, 4, TestComponent],
      [entity1, 5, TestRelationship],
    ]);
  });

  it("Finds all entity when querying just for Any wildcard", () => {
    const entity1 = new Entity();
    const entity2 = new Entity();
    const component = new Component();
    const relationship = new Relationship();
    const entities = [
      entity1,
      entity2,
      component,
      relationship,
    ];

    const result = query(entities, [
      Any,
    ]);

    assert.deepStrictEqual(result, [
      [entity1],
      [entity2],
      [component],
      [relationship],
    ]);
  });

  it("Finds all entities when querying just for All wildcard", () => {
    const entity1 = new Entity();
    const entity2 = new Entity();
    const component = new Component();
    const relationship = new Relationship();
    const entities = [
      entity1,
      entity2,
      component,
      relationship,
    ];

    const result = query(entities, [
      All,
    ]);

    assert.deepStrictEqual(result, [
      [entity1],
      [entity2],
      [component],
      [relationship],
    ]);
  });

  it("Finds all entity pairs when querying for two All wildcards", () => {
    const entity1 = new Entity();
    const entity2 = new Entity();
    const entity3 = new Entity();
    const entities = [
      entity1,
      entity2,
      entity3,
    ];

    const result = query(entities, [
      All,
      All,
    ]);

    assert.deepStrictEqual(result, [
      [entity1, entity1],
      [entity1, entity2],
      [entity1, entity3],
      [entity2, entity1],
      [entity2, entity2],
      [entity2, entity3],
      [entity3, entity1],
      [entity3, entity2],
      [entity3, entity3],
    ]);
  });

  it("", () => {
    const entities = [

    ];

    const result = query(entities, [
      All.as("source"),
      TagComponent1.on("source"),
    ]);

    assert.deepStrictEqual(result, [

    ]);
  });

  // ^^^^^^ vvvvvv What's the difference between these two?

  it("", () => {
    const entities = [

    ];

    const result = query(entities, [
      Any.as("source"),
      TagComponent1.on("source"),
    ]);

    assert.deepStrictEqual(result, [

    ]);
  });
});

// TODO: Maybe lone wildcards, since they have the implicit `.on($this)`, means any component actually?
//  Ah nvm perhaps, they don't have a `.on`. Should they? Probably not.
//  Then perhaps it's time to simplify the wildcard usage, where they can used and so on...


// TODO: Boolean queries (perhaps check out the existing tests to figure out some funky edge cases)
// TODO: Assert types in the tests (many are wrong)

function setupComponents() {
  TagComponent1 = new Component();
  TagComponent2 = new Component();
  StringComponent1 = new Component();
  NumberComponent1 = new Component();
  NumberComponent2 = new Component();

  components = [
    TagComponent1,
    TagComponent2,
    StringComponent1,
    NumberComponent1,
    NumberComponent2,
  ];
}

function setupRelationships() {
  TagRelationship1 = new Relationship();
  TagRelationship2 = new Relationship();
  NumberRelationship1 = new Relationship();
  NumberRelationship2 = new Relationship();

  relationships = [
    TagRelationship1,
    TagRelationship2,
    NumberRelationship1,
    NumberRelationship2,
  ];
}

function setupEntities({
  count,
  includeComponents
}: {
  count: number,
  includeComponents: boolean
}): Entity[] {
  const entities = [];

  for (let i = 0; i < count; i++) {
    entities.push(new Entity());
  }

  if (includeComponents) {
    entities.concat(components);
    entities.concat(relationships);
  }

  return entities;
}