import { describe, it, } from "node:test";
import * as assert from "node:assert";
import { query } from "./query.ts";
import { Entity } from "../entity/index.ts";
import { Component, } from "../component/index.ts";
import { Relationship } from "../relationship/index.ts";
import { assertTypesEqual } from "../utils/type-assertions.ts";

const x = Entity.as("x").type();
const y = Component.as("y").type();
const z = Relationship.as("z").type();


describe(query.name, () => {
  it("Finds nothing when input is empty array", () => {
    // Arrange
    const { all } = createEntities({ count: 3 });

    // Act
    const result = query(all, []);

    // Assert
    assertTypesEqual<typeof result, []>(true);
    assert.deepStrictEqual(result, []);
  });

  it("Finds nothing when input is empty object", () => {
    // Arrange
    const { all } = createEntities({ count: 3 });

    // Act
    const result = query(all, {});

    // Assert
    assertTypesEqual<typeof result, {}>(true);
    assert.deepStrictEqual(result, {});
  });

  it("Finds all entities, components, and relationships when querying for Entity", () => {
    // Arrange
    const { all } = createEntities({ count: 3 });

    // Act
    const result = query(all, [Entity]);

    // Assert
    assertTypesEqual<typeof result, [Entity]>(true);
    assert.deepStrictEqual(result, all);
  });

  it("Finds no entities when entity list is empty", () => {
    // Arrange

    // Act
    const result = query([], [Entity]);

    // Assert
    assertTypesEqual<typeof result, [Entity]>(true);
    assert.deepStrictEqual(result, []);
  });

  it("Can give entity wildcard a reference name", () => {
    // Arrange
    const { all } = createEntities({ count: 3 });

    // Act
    const result = query(all, [Entity.as("ent")]);

    // Assert
    assertTypesEqual<typeof result, [Entity]>(true);
    assert.deepStrictEqual(result, all);
  });

  it("Can find the same entity twice", () => {
    // Arrange
    const { all } = createEntities({ count: 3 });
    const allTwice = [...all, ...all];

    // Act
    const result = query(allTwice, [Entity]);

    // Assert
    assertTypesEqual<typeof result, [Entity]>(true);
    assert.deepStrictEqual(result, allTwice);
  });

  it("Can specify that an entity may only be found once", () => {
    // Arrange
    const { all } = createEntities({ count: 3 });
    const allTwice = [...all, ...all];

    // Act
    const result = query(allTwice, [Entity.once()]);

    // Assert
    assertTypesEqual<typeof result, [Entity]>(true);
    assert.deepStrictEqual(result, all);
  });

  it("Finds components when input is Component class", () => {
    // Arrange
    const { all, components } = createEntities({ count: 3 });
    const expected = Object.values(components).map((c) => [c]);

    // Act
    const result = query(all, [Component]);

    // Assert
    assertTypesEqual<typeof result, [Component<any>]>(true);
    assert.deepStrictEqual(result, expected);
  });

  it("Can give component wildcard a reference name", () => {
    // Arrange
    const { all, components } = createEntities({ count: 3 });
    const expected = Object.values(components).map((c) => [c]);

    // Act
    const result = query(all, [Component.as("comp")]);

    // Assert
    assertTypesEqual<typeof result, [Component<any>]>(true);
    assert.deepStrictEqual(result, expected);
  });

  it("Can find the same component twice", () => {
    // Arrange
    const { all, components } = createEntities({ count: 3 });
    const allTwice = [...all, ...all];
    const expected = [
      ...Object.values(components),
      ...Object.values(components),
    ];

    // Act
    const result = query(allTwice, [Component]);

    // Assert
    assertTypesEqual<typeof result, [Component<any>]>(true);
    assert.deepStrictEqual(result, expected);
  });

  it("Can specify that a component wildcard may only be found once", () => {
    // Arrange
    const { all, components } = createEntities({ count: 3 });
    const allTwice = [...all, ...all];
    const expected = Object.values(components);

    // Act
    const result = query(allTwice, [Component.once()]);

    // Assert
    assertTypesEqual<typeof result, [Component<any>]>(true);
    assert.deepStrictEqual(result, expected);
  });

  it("Can specify entity wildcard as component wildcard source", () => {
    // Arrange
    const { all, components, entities } = createEntities({ count: 3 });
    entities[0].add(components.Tag1, components.Number1.withValue(1));
    entities[1].add(components.Tag2);
    entities[2].add(components.Tag1, components.Number2.withValue(2));

    // Act
    const result = query(all, [Component.on(Entity)]);

    // Assert
    assertTypesEqual<typeof result, [Component<any>]>(true);
    assert.deepStrictEqual(result, expected);
  });

  // TODO: Rethink, "component instance wildcard" vs "component class wildcard"
  // TODO: Queries on specific components (instead of wildcard)


  it("Finds relationships when input is Relationship class", () => {
    // Arrange
    const { all, relationships } = createEntities({ count: 3 });
    const expected = Object.values(relationships).map((r) => [r]);

    // Act
    const result = query(all, [Relationship]);

    // Assert
    assertTypesEqual<typeof result, [Relationship<any>]>(true);
    assert.deepStrictEqual(result, relationships);
  });

  it("Finds entities with specified tag", () => {
    // Arrange
    const allEntities = setupEntities({ count: 3, includeComponents: true });
    entities

    // Act
    const result = query(allEntities, [Entity, TagComponent1]);

    // Assert
    assert.deepStrictEqual(result, [
      [allEntities[0], null],
      [allEntities[2], null],
    ]);
  });

  it("Finds entities with specified value component", () => {
    const allEntities = [
      new Entity().add(NumberComponent1.withValue(1)),
      new Entity().add(StringComponent1.withValue("hello")),
      new Entity().add(NumberComponent1.withValue(2)),
      new Entity().add(),
    ];

    const result = query(allEntities, [Entity, NumberComponent1]);

    assert.deepStrictEqual(result, [
      [allEntities[0], 1],
      [allEntities[2], 2],
    ]);
  });

  it("Finds specified components without retrieving entity", () => {
    const allEntities = [
      new Entity().add(NumberComponent1.withValue(1)),
      new Entity().add(StringComponent1.withValue("hello")),
      new Entity().add(NumberComponent1.withValue(2)),
      new Entity().add(),
    ];

    const result = query(allEntities, [NumberComponent1]);

    assert.deepStrictEqual(result, [
      [1],
      [2],
    ]);
  });

  it("Finds entities with multiple components", () => {
    const allEntities = [
      new Entity().add(TagComponent1, NumberComponent1.withValue(1)),
      new Entity().add(TagComponent2, StringComponent1.withValue("hello")),
      new Entity().add(TagComponent2, NumberComponent1.withValue(2)),
      new Entity().add(TagComponent1, NumberComponent1.withValue(3)),
      new Entity().add(),
    ];

    const result = query(allEntities, [Entity, TagComponent1, NumberComponent1]);

    assert.deepStrictEqual(result, [
      [allEntities[0], null, 1],
      [allEntities[3], null, 3],
    ]);
  });

  it("Returns output as object when input is object", () => {
    const allEntities = [
      new Entity("First").add(NumberComponent1.withValue(1)),
      new Entity("Second"),
      new Entity("Third").add(NumberComponent1.withValue(2)),
    ];

    const result = query(allEntities, {
      entity: Entity,
      component: NumberComponent1,
    });

    assert.deepStrictEqual(result, [
      { entity: allEntities[0], component: 1 },
      { entity: allEntities[2], component: 2 },
    ]);
  });

  it("Finds relationships to other entities", () => {
    const targetEntity1 = new Entity();
    const targetEntity2 = new Entity();
    const allEntities = [
      targetEntity1,
      targetEntity2,
      new Entity().add(NumberRelationship1.to(targetEntity1).withValue(1)),
      new Entity().add(NumberRelationship2.to(targetEntity1).withValue(2)),
      new Entity().add(NumberRelationship1.to(targetEntity2).withValue(3)),
    ];

    const result = query(allEntities, [Entity, NumberRelationship1]);

    assert.deepStrictEqual(result, [
      [allEntities[2], 1],
      [allEntities[4], 3],
    ]);
  });

  it("Finds relationships to specific entities", () => {
    const targetEntity1 = new Entity();
    const targetEntity2 = new Entity();
    const allEntities = [
      targetEntity1,
      targetEntity2,
      new Entity().add(NumberRelationship1.to(targetEntity1).withValue(1)),
      new Entity().add(NumberRelationship2.to(targetEntity1).withValue(2)),
      new Entity().add(NumberRelationship1.to(targetEntity2).withValue(3)),
    ];

    const result = query(allEntities, [Entity, NumberRelationship1.to(targetEntity1)]);

    assert.deepStrictEqual(result, [
      [allEntities[2], 1],
    ]);
  });

  it("Finds relationships and target entities", () => {
    const targetEntity1 = new Entity();
    const targetEntity2 = new Entity();
    const allEntities = [
      targetEntity1,
      targetEntity2,
      new Entity().add(NumberRelationship1.to(targetEntity1).withValue(1)),
      new Entity().add(NumberRelationship2.to(targetEntity1).withValue(2)),
      new Entity().add(NumberRelationship1.to(targetEntity2).withValue(3)),
    ];

    const result = query(allEntities, [Entity, Entity.as("target"), NumberRelationship1.to("target")]);

    assert.deepStrictEqual(result, [
      [allEntities[2], targetEntity1, 1],
      [allEntities[4], targetEntity2, 3],
    ]);
  });

  it("Finds implicit relationship to self", () => {
    const entity1 = new Entity();
    entity1.add(TagRelationship1.to(entity1));
    const allEntities = [
      entity1,
    ];

    const result = query(allEntities, [
      Entity, TagRelationship1.to("ent"),
    ]);

    assert.deepStrictEqual(result, [
      [entity1, entity1],
    ]);
  });

  it("Finds explicit relationship by reference to self", () => {
    const entity1 = new Entity();
    entity1.add(TagRelationship1.to(entity1));
    const allEntities = [
      entity1,
    ];

    const result = query(allEntities, [
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
    const allEntities = [
      targetEntity1,
      targetEntity2,
      new Entity().add(NumberRelationship1.to(targetEntity1).withValue(3)).add(NumberComponent1.withValue(6)),
      new Entity().add(NumberRelationship2.to(targetEntity1).withValue(4)).add(NumberComponent2.withValue(7)),
      new Entity().add(NumberRelationship1.to(targetEntity2).withValue(5)).add(NumberComponent1.withValue(8)),
    ];

    const result = query(allEntities, [
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
    const allEntities = [
      entity1,
      entity2,
    ];

    const result = query(allEntities, [
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
    const allEntities = [
      entity1,
      entity2,
    ];

    const result = query(allEntities, [
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
    const allEntities = [
      entity1,
      entity2,
    ];

    const result = query(allEntities, [
      Entity,
      Entity.as("ref"),
    ]);

    assert.deepStrictEqual(result, [
      [entity1, entity1],
      [entity2, entity2],
    ]);
  });

  it("Finds entity component is on that references entity", () => {
    const allEntities = [
      new Entity().add(TagComponent1),
      new Entity().add(TagComponent2),
      new Entity().add(TagComponent1),
    ];

    const result = query(allEntities, [
      Entity.as("ref"),
      TagComponent1.on("ref"),
    ]);

    assert.deepStrictEqual(result, [
      [allEntities[0], null],
      [allEntities[2], null],
    ]);
  });

  it("Finds multiple components on same reference", () => {
    const allEntities = [
      new Entity(),
      new Entity().add(TagComponent1),
      new Entity().add(TagComponent2),
      new Entity().add(TagComponent1, TagComponent2),
      new Entity().add(TagComponent2, TagComponent1),
    ];

    const result = query(allEntities, [
      TagComponent1.on("ref"),
      TagComponent2.on("ref"),
    ]);

    assert.deepStrictEqual(result, [
      [null, null],
      [null, null],
    ]);
  });

  it("Finds multiple entities and components with different references", () => {
    const allEntities = [
      new Entity(),
      new Entity().add(TagComponent1),
      new Entity().add(TagComponent2),
      new Entity().add(TagComponent1, TagComponent2),
      new Entity().add(TagComponent2, TagComponent1),
      new Entity().add(TagComponent2),
    ];

    const result = query(allEntities, [
      Entity.as("ref1"),
      TagComponent1.on("ref1"),
      Entity.as("ref2"),
      TagComponent2.on("ref2"),
    ]);

    assert.deepStrictEqual(result, [
      [allEntities[1], null, allEntities[2], null],
      [allEntities[2], null, allEntities[3], null],
      [allEntities[3], null, allEntities[3], null],
      [allEntities[4], null, allEntities[4], null],
    ]);
  });

  it("Finds entities by wrapping around the list if there are multiple references", () => {
    const allEntities = [
      new Entity().add(TagComponent1),
      new Entity().add(TagComponent1, TagComponent2),
      new Entity().add(TagComponent2),
    ];

    const result = query(allEntities, [
      Entity.as("ref1"),
      TagComponent1.on("ref1"),
      Entity.as("ref2"),
      TagComponent2.on("ref2"),
    ]);

    assert.deepStrictEqual(result, [
      [allEntities[0], null, allEntities[1], null],
      [allEntities[1], null, allEntities[1], null],
      [allEntities[2], null, allEntities[1], null],
    ]);
  });

  it("Does not find entity if other entity reference is not found", () => {
    const allEntities = [
      new Entity().add(TagComponent1),
      new Entity().add(TagComponent1),
    ];

    const result = query(allEntities, [
      Entity.as("ref1"),
      TagComponent2.on("ref2"),
    ]);

    assert.deepStrictEqual(result, []);
  });

  it("Find same entity even under different reference names", () => {
    const allEntities = [
      new Entity().add(NumberComponent1.withValue(1)),
      new Entity().add(NumberComponent1.withValue(2)),
    ];

    const result = query(allEntities, [
      Entity.as("ref1"),
      Entity.as("ref2"),
    ]);

    assert.deepStrictEqual(result, [
      [allEntities[0], allEntities[0]],
      [allEntities[1], allEntities[1]],
    ]);
  });

  it("Find an entity that is not the same entity", () => {
    const allEntities = [
      new Entity().add(NumberComponent1.withValue(1)),
      new Entity().add(NumberComponent1.withValue(2)),
    ];

    const result = query(allEntities, [
      // TODO: currently not supported. Add a "equals"?
    ]);

    assert.deepStrictEqual(result, [
      [allEntities[0], 1],
      [allEntities[1], 2],
    ]);
  });

  it("Finds relationship on referenced entity", () => {
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(TagRelationship1.to(entity2));
    const allEntities = [
      entity1,
      entity2,
    ];

    const result = query(allEntities, [
      Entity.as("ref1"),
      TagRelationship1.on("ref1"),
    ]);

    assert.deepStrictEqual(result, [
      [allEntities[0], null],
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
    const allEntities = [
      entity1,
      entity2,
      entity3,
    ];

    const result = query(allEntities, [
      Entity.as("ref"),
      TagRelationship1.on(entity2).to("ref"),
    ]);

    assert.deepStrictEqual(result, [
      [allEntities[0], null],
      [allEntities[2], null],
    ]);
  });

  it("Finds entity with indirect link to self, despite references under different name", () => {
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(TagRelationship1.to(entity2));
    entity2.add(TagRelationship1.to(entity1));
    const allEntities = [
      entity1,
      entity2,
    ];

    const result = query(allEntities, [
      Entity.as("ref1"),
      TagRelationship1.on("ref1").to("ref2"),
      TagRelationship1.on("ref2").to("ref1"),
    ]);

    assert.deepStrictEqual(result, [
      [allEntities[0], allEntities[1], allEntities[0]],
    ]);
  });

  it("Find component on component and entity", () => {
    const Comp1 = new Component<number>();
    const Comp2 = new Component<string>();
    Comp1.add(Comp2.withValue("one"));
    Comp2.add(Comp1.withValue(1));
    const allEntities = [
      Comp1,
      Comp2,
      new Entity().add(Comp1.withValue(2)),
      new Entity().add(Comp2.withValue("two")),
    ];

    const result = query(allEntities, [
      Entity,
      Comp1,
    ]);

    assert.deepStrictEqual(result, [
      [allEntities[0], 1],
      [allEntities[2], 2],
    ]);
  });

  it("Finds relationship on entity to component", () => {
    const entity1 = new Entity();
    const entity2 = new Entity();
    entity1.add(NumberRelationship1.to(TagComponent1).withValue(1));
    const allEntities = [
      NumberRelationship1,
      TagComponent1,
      entity1,
      entity2,
    ];

    const result = query(allEntities, [
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
    const allEntities = [
      Comp1,
      Comp2,
      new Entity().add(Comp1.withValue(2)),
      new Entity().add(Comp2.withValue("two")),
    ];

    const result = query(allEntities, [
      Comp1.as("ref"),
      Comp2.on("ref"),
    ]);

    assert.deepStrictEqual(result, [
      [allEntities[0], "one"],
    ]);
  });

  it("Find relationships on components", () => {
    const Comp1 = new Component<number>();
    const Comp2 = new Component<string>();
    const Rel1 = new Relationship<number>();
    const Rel2 = new Relationship<string>();
    Comp1.add(Rel1.to(Comp2).withValue(1));
    Comp2.add(Rel1.to(Rel2).withValue(2));
    const allEntities = [
      Comp1,
      Comp2,
      Rel1,
      Rel2,
    ];

    const result = query(allEntities, [
      Rel2.on("source").to("target"),
      Entity.as("source"),
      Entity.as("target"),
    ]);

    assert.deepStrictEqual(result, [
      [1, allEntities[0], allEntities[1]],
      [2, allEntities[1], allEntities[3]],
    ]);
  });

  it("Find relationships on relationships", () => {
    const Comp1 = new Component<number>();
    const Comp2 = new Component<string>();
    const Rel1 = new Relationship<number>();
    const Rel2 = new Relationship<string>();
    Rel1.add(Rel2.to(Comp1).withValue("one"));
    Rel2.add(Rel2.to(Rel1).withValue("two"));
    const allEntities = [
      Comp1,
      Comp2,
      Rel1,
      Rel2,
    ];

    const result = query(allEntities, [
      Rel2.on("source").to("target"),
      Entity.as("source"),
      Entity.as("target"),
    ]);

    assert.deepStrictEqual(result, [
      ["one", allEntities[2], allEntities[0]],
      ["two", allEntities[3], allEntities[2]],
    ]);
  });

  it("Finds relationship component", () => {
    const entity = new Entity();
    const relComp = NumberRelationship1.to(entity);
    entity.add(relComp.withValue(1));
    const allEntities = [
      NumberRelationship1,
      relComp,
      entity,
    ];

    const result = query(allEntities, [
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
    const allEntities = [
      NumberRelationship1,
      NumberRelationship2,
      relComp,
      entity1,
      entity2,
    ];

    const result = query(allEntities, [
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
    const allEntities = [
      entity1,
      entity2,
      entity3,
      entity4,
      entity5,
      entity6,
      TestComponent,
      TestRelationship,
    ];

    const result = query(allEntities, [
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
    const allEntities = [
      entity1,
      entity2,
      entity3,
      entity4,
      entity5,
      entity6,
      TestComponent,
      TestRelationship,
    ];

    const wildcardResult = query(allEntities, [Entity, TagRelationship1.to(Any)]);
    const referenceResult = query(allEntities, [Entity, TagRelationship1.to("ref")]);

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
    const allEntities = [
      entity1,
      entity2,
      entity3,
    ];

    const result = query(allEntities, [
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
    const allEntities = [
      entity1,
      entity2,
      entity3,
    ];

    const result = query(allEntities, [
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
    const allEntities = [
      entity1,
      entity2,
      TestComponent,
      TestRelationship,
    ];

    const result = query(allEntities, [
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
    const allEntities = [
      entity1,
      entity2,
      TestComponent,
      TestRelationship,
    ];

    const result = query(allEntities, [
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
    const allEntities = [
      entity1,
      entity2,
      component,
      relationship,
    ];

    const result = query(allEntities, [
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
    const allEntities = [
      entity1,
      entity2,
      component,
      relationship,
    ];

    const result = query(allEntities, [
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
    const allEntities = [
      entity1,
      entity2,
      entity3,
    ];

    const result = query(allEntities, [
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
    const allEntities = [];

    const result = query(allEntities, [
      All.as("source"),
      TagComponent1.on("source"),
    ]);

    assert.deepStrictEqual(result, []);
  });

  // ^^^^^^ vvvvvv What's the difference between these two?

  it("", () => {
    const allEntities = [];

    const result = query(allEntities, [
      Any.as("source"),
      TagComponent1.on("source"),
    ]);

    assert.deepStrictEqual(result, []);
  });
});

// TODO: Boolean queries (perhaps check out the existing tests to figure out some funky edge cases)

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

function setupEntities2({
  count,
  includeComponents
}: {
  count: number,
  includeComponents: boolean
}): Entity[] {
  const allEntities: Entity[] = [];

  entities = [];

  for (let i = 0; i < count; i++) {
    entities.push(new Entity());
  }

  allEntities.concat(entities);

  if (includeComponents) {
    allEntities.concat(components);
    allEntities.concat(relationships);
  }

  return allEntities;
}

function createEntities(options: {
  count: number
}): {
  all: Entity[],
  entities: Entity[],
  components: {
    Tag1: Component<undefined>,
    Tag2: Component<undefined>,
    Number1: Component<number>,
    Number2: Component<number>,
    String1: Component<string>,
    String2: Component<string>,
  },
  relationships: {
    Tag1: Relationship<undefined>,
    Tag2: Relationship<undefined>,
    Number1: Relationship<number>,
    Number2: Relationship<number>,
    String1: Relationship<string>,
    String2: Relationship<string>,
  },
} {
  const entities: Entity[] = [];
  for (let i = 0; i < options.count; i++) {
    entities.push(new Entity());
  }

  const components = {
    Tag1: new Component(),
    Tag2: new Component(),
    Number1: new Component<number>(),
    Number2: new Component<number>(),
    String1: new Component<string>(),
    String2: new Component<string>(),
  };

  const relationships = {
    Tag1: new Relationship(),
    Tag2: new Relationship(),
    Number1: new Relationship<number>(),
    Number2: new Relationship<number>(),
    String1: new Relationship<string>(),
    String2: new Relationship<string>(),
  };

  const all: Entity[] = [];
  all.concat(entities);
  all.concat(Object.values(components));
  all.concat(Object.values(relationships));

  return {
    all,
    entities,
    components,
    relationships,
  };
}