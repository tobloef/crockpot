import { describe, it, } from "node:test";
import * as assert from "node:assert";
import { query } from "./query.ts";
import { Entity } from "../entity/index.ts";
import { Component } from "../component/index.ts";
import { Relationship } from "../relationship/index.ts";
import { assertTypesEqual } from "../utils/type-assertions.ts";
import type { Class } from "../utils/class.ts";
import { equals, or } from "./boolean/index.ts";

describe("Empty query", () => {
  it("Finds nothing when input is empty tuple", () => {
    // Arrange
    const { all } = createEntities({ count: 3 });

    // Act
    const arrayResult = query(all, []);
    const objectResult = query(all, {});

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[]>>(true);
    assertTypesEqual<typeof objectResult, Array<{}>>(true);

    assert.deepStrictEqual(arrayResult, []);
    assert.deepStrictEqual(objectResult, []);
  });
});

describe("Entity instance query", () => {
  it("Finds specific entity instance", () => {
    // Arrange
    const { all, entities } = createEntities({ count: 3 });

    // Act
    const arrayResult = query(all, [entities[1]]);
    const objectResult = query(all, { ent: entities[1] });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Entity]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ ent: Entity }>>(true);

    assert.deepStrictEqual(arrayResult, [entities[1]]);
    assert.deepStrictEqual(objectResult, { ent: entities[1] });
  });

  it("Can find multiple different entities in single query", () => {
    // Arrange
    const { all, entities } = createEntities({ count: 3 });

    // Act
    const arrayResult = query(all, [entities[1], entities[2]]);
    const objectResult = query(all, { ent1: entities[1], ent2: entities[2] });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Entity, Entity]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ ent1: Entity, ent2: Entity }>>(true);

    assert.deepStrictEqual(arrayResult, [entities[1], entities[2]]);
    assert.deepStrictEqual(objectResult, { ent1: entities[1], ent2: entities[2] });
  });

  it("Can find same entity multiple times in single query", () => {
    // Arrange
    const { all, entities } = createEntities({ count: 3 });

    // Act
    const arrayResult = query(all, [entities[1], entities[1]]);
    const objectResult = query(all, { ent1: entities[1], ent2: entities[1] });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Entity, Entity]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ ent1: Entity, ent2: Entity }>>(true);

    assert.deepStrictEqual(arrayResult, [entities[1], entities[1]]);
    assert.deepStrictEqual(objectResult, { ent1: entities[1], ent2: entities[1] });
  });

  it("Does not find entity if not on the list", () => {
    // Arrange
    const { all } = createEntities({ count: 3 });
    const otherEntity = new Entity();

    // Act
    const arrayResult = query(all, [otherEntity]);
    const objectResult = query(all, { ent: otherEntity });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Entity]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ ent: Entity }>>(true);

    assert.deepStrictEqual(arrayResult, []);
    assert.deepStrictEqual(objectResult, {});
  });
});

describe("Entity wildcard query", () => {
  it("Finds all entities", () => {
    // Arrange
    const { entities } = createEntities({ count: 3 });

    // Act
    const arrayResult = query(entities, [Entity]);
    const objectResult = query(entities, { ent: Entity });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Entity]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ ent: Entity }>>(true);

    assert.deepStrictEqual(arrayResult, entities.map((entity) => [entity]));
    assert.deepStrictEqual(objectResult, entities.map((entity) => ({ ent: entity })));
  });

  it("Finds all component types", () => {
    // Arrange
    const { components } = createEntities({ count: 3 });

    const expectedArray = Object.values(components).map((component) => [component]);
    const expectedObject = Object.values(components).map((component) => ({ ent: component }));

    // Act
    const arrayResult = query(Object.values(components), [Entity]);
    const objectResult = query(Object.values(components), { ent: Entity });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Entity]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ ent: Entity }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds all relationship types", () => {
    // Arrange
    const { relationships } = createEntities({ count: 3 });

    const expectedArray = Object.values(relationships).map((relationship) => [relationship]);
    const expectedObject = Object.values(relationships).map((relationship) => ({ ent: relationship }));

    // Act
    const arrayResult = query(Object.values(relationships), [Entity]);
    const objectResult = query(Object.values(relationships), { ent: Entity });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Entity]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ ent: Entity }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds nothing when entity list is empty", () => {
    // Arrange
    createEntities({ count: 3 });

    // Act
    const arrayResult = query([], [Entity]);
    const objectResult = query([], { ent: Entity });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Entity]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ ent: Entity }>>(true);

    assert.deepStrictEqual(arrayResult, []);
    assert.deepStrictEqual(objectResult, {});
  });

  it("Can give entity wildcard reference name", () => {
    // Arrange
    const { all } = createEntities({ count: 3 });

    // Act
    const arrayResult = query(all, [Entity.as("ent")]);
    const objectResult = query(all, { ent: Entity.as("ent") });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Entity]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ ent: Entity }>>(true);

    assert.deepStrictEqual(arrayResult, all.map((entity) => [entity]));
    assert.deepStrictEqual(objectResult, all.map((entity) => ({ ent: entity })));
  });

  it("Find the same entity multiple times", () => {
    // Arrange
    const { entities } = createEntities({ count: 3 });

    const expectedArray = permutations(entities);
    const expectedObject = expectedArray.map(([ent1, ent2]) => ({ ent1, ent2 }));

    // Act
    const arrayResult = query(entities, [Entity, Entity]);
    const objectResult = query(entities, { ent1: Entity, ent2: Entity });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Entity, Entity]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ ent1: Entity, ent2: Entity }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify that an entity may only be found once for a wildcard", () => {
    // Arrange
    const { entities } = createEntities({ count: 3 });
    const expectedArray = [
      [entities[0], entities[0], entities[0]],
      [entities[1], entities[0], entities[0]],
      [entities[2], entities[0], entities[0]],
    ]
    const expectedObject = expectedArray.map(([ent1, ent2, ent3]) => ({ ent1, ent2, ent3 }));

    // Act
    const arrayResult = query(entities, [Entity.once(), Entity, Entity]);
    const objectResult = query(entities, { ent1: Entity.once(), ent2: Entity, ent3: Entity });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Entity, Entity, Entity]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ ent1: Entity, ent2: Entity, ent3: Entity }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify that multiple entities may only be found once for their wildcards", () => {
    // Arrange
    const { entities } = createEntities({ count: 3 });
    const expectedArray = [
      [entities[0], entities[0], entities[0]],
      [entities[1], entities[1], entities[0]],
      [entities[2], entities[2], entities[0]],
    ]
    const expectedObject = expectedArray.map(([ent1, ent2, ent3]) => ({ ent1, ent2, ent3 }));

    // Act
    const arrayResult = query(entities, [Entity.once(), Entity.once(), Entity]);
    const objectResult = query(entities, { ent1: Entity.once(), ent2: Entity.once(), ent3: Entity });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Entity, Entity, Entity]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ ent1: Entity, ent2: Entity, ent3: Entity }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify multiple wildcards with different reference names", () => {
    // Arrange
    const { entities } = createEntities({ count: 3 });
    const expectedArray = permutations(entities);
    const expectedObject = expectedArray.map(([ent1, ent2]) => ({ ent1, ent2 }));

    // Act
    const arrayResult = query(entities, [Entity.as("one"), Entity.as("two")]);
    const objectResult = query(entities, { ent1: Entity.as("one"), ent2: Entity.as("two") });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Entity, Entity]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ ent1: Entity, ent2: Entity }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify multiple wildcards with same reference name", () => {
    // Arrange
    const { entities } = createEntities({ count: 3 });
    const expectedArray = entities.map((ent) => [ent, ent]);
    const expectedObject = entities.map((ent) => ({ ent1: ent, ent2: ent }));

    // Act
    const arrayResult = query(entities, [Entity.as("ref"), Entity.as("ref")]);
    const objectResult = query(entities, { ent1: Entity.as("ref"), ent2: Entity.as("ref") });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Entity, Entity]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ ent1: Entity, ent2: Entity }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify same reference name on a wildcard as another wildcard that may only be found once", () => {
    // Arrange
    const { entities } = createEntities({ count: 3 });
    const expectedArray = [
      [entities[0], entities[0], entities[0]],
      [entities[1], entities[1], entities[0]],
      [entities[2], entities[2], entities[0]],
    ];
    const expectedObject = expectedArray.map(([ent1, ent2, ent3]) => ({ ent1, ent2, ent3 }));

    // Act
    const arrayResult = query(entities, [Entity.as("a").once(), Entity.as("a"), Entity.as("c")]);
    const objectResult = query(entities, { ent1: Entity.as("a").once(), ent2: Entity.as("a"), ent3: Entity.as("c") });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Entity, Entity, Entity]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ ent1: Entity, ent2: Entity, ent3: Entity }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });
});

describe("Entity type query", () => {
  it("Finds that type of base entities are Entity", () => {
    // Arrange
    const { entities } = createEntities({ count: 3 });

    // Act
    const arrayResult = query(entities, [Entity.type()]);
    const objectResult = query(entities, { typ: Entity.type() });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Class<Entity>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ typ: Class<Entity> }>>(true);

    assert.deepStrictEqual(arrayResult, entities.map(() => [Entity]));
    assert.deepStrictEqual(objectResult, entities.map(() => ({ typ: Entity })));
  });

  it("Finds that type of component types are the component types", () => {
    // Arrange
    const { components } = createEntities({ count: 3 });

    // Act
    const arrayResult = query(Object.values(components), [Entity.type()]);
    const objectResult = query(Object.values(components), { typ: Entity.type() });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Class<Entity>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ typ: Class<Entity> }>>(true);

    assert.deepStrictEqual(arrayResult, Object.values(components).map(() => [Component]));
    assert.deepStrictEqual(objectResult, Object.values(components).map(() => ({ typ: Component })));
  });

  it("Finds that type of relationship types are the relationship types", () => {
    // Arrange
    const { relationships } = createEntities({ count: 3 });

    // Act
    const arrayResult = query(Object.values(relationships), [Entity.type()]);
    const objectResult = query(Object.values(relationships), { typ: Entity.type() });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Class<Entity>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ typ: Class<Entity> }>>(true);

    assert.deepStrictEqual(arrayResult, Object.values(relationships).map(() => [Relationship]));
    assert.deepStrictEqual(objectResult, Object.values(relationships).map(() => ({ typ: Relationship })));
  });

  it("Can specify reference name for entity type", () => {
    // Arrange
    const { entities } = createEntities({ count: 3 });

    // Act
    const arrayResult = query(entities, [Entity.type().as("typ")]);
    const objectResult = query(entities, { typ: Entity.type().as("typ") });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Class<Entity>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ typ: Class<Entity> }>>(true);

    assert.deepStrictEqual(arrayResult, entities.map(() => [Entity]));
    assert.deepStrictEqual(objectResult, entities.map(() => ({ typ: Entity })));
  });

  it("Can find the same entity type multiple times", () => {
    // Arrange
    const { entities: [entity], components: { Tag1 } } = createEntities({ count: 1 });
    const entityList = [entity, Tag1];

    const expectedArray = [
      [Entity, Entity],
      [Entity, Tag1],
      [Tag1, Entity],
      [Tag1, Tag1],
    ];
    const expectedObject = expectedArray.map(([typ1, typ2]) => ({ typ1, typ2 }));

    // Act
    const arrayResult = query(entityList, [Entity.type(), Entity.type()]);
    const objectResult = query(entityList, { typ1: Entity.type(), typ2: Entity.type() });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Class<Entity>, Class<Entity>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ typ1: Class<Entity>, typ2: Class<Entity> }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify that an entity type may only be found once for a wildcard", () => {
    // Arrange
    const {
      entities: [entity],
      components: { Tag1 },
      relationships: { Number1 },
    } = createEntities({ count: 1 });
    const entityList = [entity, Tag1, Number1];

    const expectedArray = [
      [Entity, Entity, Entity],
      [Tag1, Entity, Entity],
      [Number1, Entity, Entity],
    ];
    const expectedObject = expectedArray.map(([typ1, typ2, typ3]) => ({ typ1, typ2, typ3 }));

    // Act
    const arrayResult = query(entityList, [Entity.type().once(), Entity.type(), Entity.type()]);
    const objectResult = query(entityList, { typ1: Entity.type().once(), typ2: Entity.type(), typ3: Entity.type() });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Class<Entity>, Class<Entity>, Class<Entity>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ typ1: Class<Entity>, typ2: Class<Entity>, typ3: Class<Entity> }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify that multiple entities types may only be found once for their wildcards", () => {
    // Arrange
    const {
      entities: [entity],
      components: { Tag1 },
      relationships: { Number1 },
    } = createEntities({ count: 1 });
    const entityList = [entity, Tag1, Number1];

    const expectedArray = [
      [Entity, Entity, Entity],
      [Tag1, Tag1, Entity],
      [Number1, Number1, Entity],
    ];
    const expectedObject = expectedArray.map(([typ1, typ2, typ3]) => ({ typ1, typ2, typ3 }));

    // Act
    const arrayResult = query(
      entityList,
      [Entity.type().once(), Entity.type().once(), Entity.type()],
    );
    const objectResult = query(
      entityList,
      { typ1: Entity.type().once(), typ2: Entity.type().once(), typ3: Entity.type() },
    );

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Class<Entity>, Class<Entity>, Class<Entity>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ typ1: Class<Entity>, typ2: Class<Entity>, typ3: Class<Entity> }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify multiple types with different reference names", () => {
    // Arrange
    const {
      entities: [entity],
      components: { Tag1 },
      relationships: { Number1 },
    } = createEntities({ count: 1 });
    const entityList = [entity, Tag1, Number1];

    const expectedArray = [
      [Entity, Entity],
      [Entity, Tag1],
      [Entity, Number1],
      [Tag1, Entity],
      [Tag1, Tag1],
      [Tag1, Number1],
      [Number1, Entity],
      [Number1, Tag1],
      [Number1, Number1],
    ];
    const expectedObject = expectedArray.map(([typ1, typ2]) => ({ typ1, typ2 }));

    // Act
    const arrayResult = query(entityList, [Entity.type().as("one"), Entity.type().as("two")]);
    const objectResult = query(entityList, { typ1: Entity.type().as("one"), typ2: Entity.type().as("two") });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Class<Entity>, Class<Entity>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ typ1: Class<Entity>, typ2: Class<Entity> }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify multiple types with same reference name", () => {
    // Arrange
    const {
      entities: [entity],
      components: { Tag1 },
      relationships: { Number1 },
    } = createEntities({ count: 1 });
    const entityList = [entity, Tag1, Number1];

    const expectedArray = [
      [Entity, Entity],
      [Tag1, Tag1],
      [Number1, Number1],
    ];
    const expectedObject = expectedArray.map(([typ1, typ2]) => ({ typ1, typ2 }));

    // Act
    const arrayResult = query(entityList, [Entity.type().as("ref"), Entity.type().as("ref")]);
    const objectResult = query(entityList, { typ1: Entity.type().as("ref"), typ2: Entity.type().as("ref") });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Class<Entity>, Class<Entity>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ typ1: Class<Entity>, typ2: Class<Entity> }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify same reference name on a type as another type that may only be found once", () => {
    // Arrange
    const {
      entities: [entity],
      components: { Tag1 },
      relationships: { Number1 },
    } = createEntities({ count: 1 });
    const entityList = [entity, Tag1, Number1];

    const expectedArray = [
      [Entity, Entity, Entity],
      [Tag1, Tag1, Entity],
      [Number1, Number1, Entity],
    ];
    const expectedObject = expectedArray.map(([typ1, typ2, typ3]) => ({ typ1, typ2, typ3 }));

    // Act
    const arrayResult = query(
      entityList,
      [Entity.type().as("a").once(), Entity.type().as("a"), Entity.type().as("c")],
    );
    const objectResult = query(
      entityList,
      { typ1: Entity.type().as("a").once(), typ2: Entity.type().as("a"), ent3: Entity.type().as("c") },
    );

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Class<Entity>, Class<Entity>, Class<Entity>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ typ1: Class<Entity>, typ2: Class<Entity>, ent3: Class<Entity> }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });
});

describe("Component instance query", () => {
  it("Finds tag components on entities", () => {
    // Arrange
    const { all, entities, components: { Tag1, Tag2 } } = createEntities({ count: 4 });
    entities[1].add(Tag1);
    entities[3].add(Tag2);

    // Act
    const arrayResult = query(all, [Tag1]);
    const objectResult = query(all, { tag: Tag1 });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[undefined]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ tag: undefined }>>(true);

    assert.deepStrictEqual(arrayResult, [[undefined]]);
    assert.deepStrictEqual(objectResult, [{ tag: undefined }]);
  });

  it("Finds value component on entities", () => {
    // Arrange
    const { all, entities, components: { Number1, Number2 } } = createEntities({ count: 4 });
    entities[1].add(Number1.withValue(1));
    entities[3].add(Number2.withValue(2));

    // Act
    const arrayResult = query(all, [Number1]);
    const objectResult = query(all, { val: Number1 });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: number }>>(true);

    assert.deepStrictEqual(arrayResult, [[1]]);
    assert.deepStrictEqual(objectResult, [{ val: 1 }]);
  });

  it("Can require multiple different component values in single query", () => {
    // Arrange
    const { all, entities, components: { Number1, Number2 } } = createEntities({ count: 4 });
    entities[1].add(Number1.withValue(1));
    entities[1].add(Number2.withValue(2));
    entities[2].add(Number1.withValue(3));
    entities[3].add(Number2.withValue(4));

    // Act
    const arrayResult = query(all, [Number1, Number2]);
    const objectResult = query(all, { val1: Number1, val2: Number2 });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number, number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val1: number, val2: number }>>(true);

    assert.deepStrictEqual(arrayResult, [[1, 2]]);
    assert.deepStrictEqual(objectResult, [{ val1: 1, val2: 2 }]);
  });

  it("Can find multiple value instances of the same component", () => {
    // Arrange
    const { all, entities, components: { Number1 } } = createEntities({ count: 4 });
    entities[1].add(Number1.withValue(1));
    entities[2].add(Number1.withValue(2));

    // Act
    const arrayResult = query(all, [Number1]);
    const objectResult = query(all, { val: Number1 });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: number }>>(true);

    assert.deepStrictEqual(arrayResult, [[1], [2]]);
    assert.deepStrictEqual(objectResult, [{ val: 1 }, { val: 2 }]);
  });

  it("Can find same component value multiple times in single query", () => {
    // Arrange
    const { all, entities, components: { Number1 } } = createEntities({ count: 4 });
    entities[1].add(Number1.withValue(1));
    entities[2].add(Number1.withValue(2));

    // Act
    const arrayResult = query(all, [Number1, Number1]);
    const objectResult = query(all, { val1: Number1, val2: Number1 });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number, number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val1: number, val2: number }>>(true);

    assert.deepStrictEqual(arrayResult, [[1, 1], [2, 2]]);
    assert.deepStrictEqual(objectResult, [{ val1: 1, val2: 1 }, { val1: 2, val2: 2 }]);
  });

  it("Does not find component value if not on an entity", () => {
    // Arrange
    const { all, components: { Number1 } } = createEntities({ count: 4 });

    // Act
    const arrayResult = query(all, [Number1]);
    const objectResult = query(all, { val: Number1 });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: number }>>(true);

    assert.deepStrictEqual(arrayResult, []);
    assert.deepStrictEqual(objectResult, []);
  });

  it("Finds component value on specific entity", () => {
    // Arrange
    const { all, entities, components: { Number1, Number2 } } = createEntities({ count: 4 });
    entities[1].add(Number1.withValue(1));
    entities[3].add(Number1.withValue(2));

    // Act
    const arrayResult = query(all, [Number1.on(entities[1])]);
    const objectResult = query(all, { val: Number1.on(entities[1]) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: number }>>(true);

    assert.deepStrictEqual(arrayResult, [[1]]);
    assert.deepStrictEqual(objectResult, [{ val: 1 }]);
  });

  it("Finds component value on unused reference", () => {
    // Arrange
    const { all, entities, components: { Number1, Number2 } } = createEntities({ count: 4 });
    entities[1].add(Number1.withValue(1));
    entities[3].add(Number1.withValue(2));

    // Act
    const arrayResult = query(all, [Number1.on("ref")]);
    const objectResult = query(all, { val: Number1.on("ref") });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: number }>>(true);

    assert.deepStrictEqual(arrayResult, [[1], [2]]);
    assert.deepStrictEqual(objectResult, [{ val: 1 }, { val: 2 }]);
  });

  it("Finds component value on entity reference", () => {
    // Arrange
    const { all, entities, components: { Number1 } } = createEntities({ count: 4 });
    entities[1].add(Number1.withValue(1));
    entities[3].add(Number1.withValue(2));

    // Act
    const arrayResult = query(all, [Entity.as("ref"), Number1.on("ref")]);
    const objectResult = query(all, { ent: Entity, val: Number1.on("ref") });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Entity, number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ ent: Entity, val: number }>>(true);

    assert.deepStrictEqual(arrayResult, [[entities[1], 1], [entities[3], 2]]);
    assert.deepStrictEqual(objectResult, [{ ent: entities[1], val: 1 }, { ent: entities[3], val: 2 }]);
  });

  it("Finds component value on any entity using wildcard", () => {
    // Arrange
    const { all, entities, components: { Number1 } } = createEntities({ count: 4 });
    entities[1].add(Number1.withValue(1));
    entities[3].add(Number1.withValue(2));

    // Act
    const arrayResult = query(all, [Number1.on(Entity)]);
    const objectResult = query(all, { val: Number1.on(Entity) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: number }>>(true);

    assert.deepStrictEqual(arrayResult, [[1], [2]]);
    assert.deepStrictEqual(objectResult, [{ val: 1 }, { val: 2 }]);
  });

  it("Finds component value on any component type using wildcard", () => {
    // Arrange
    const { all, entities, components: { Number1, Tag1 } } = createEntities({ count: 4 });
    entities[1].add(Number1.withValue(1));
    entities[3].add(Number1.withValue(2));
    Number1.add(Number1.withValue(3));
    Tag1.add(Number1.withValue(4));

    // Act
    const arrayResult = query(all, [Number1.on(Component)]);
    const objectResult = query(all, { val: Number1.on(Component) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: number }>>(true);

    assert.deepStrictEqual(arrayResult, [[3], [4]]);
    assert.deepStrictEqual(objectResult, [{ val: 3 }, { val: 4 }]);
  });

  it("Finds component value on any relationship type using wildcard", () => {
    // Arrange
    const { all, entities, components, relationships } = createEntities({ count: 4 });
    entities[1].add(components.Number1.withValue(1));
    components.Number1.add(components.Number1.withValue(2));
    relationships.Tag1.add(components.Number1.withValue(3));
    relationships.String1.add(components.Number1.withValue(4));

    // Act
    const arrayResult = query(all, [components.Number1.on(Relationship)]);
    const objectResult = query(all, { val: components.Number1.on(Relationship) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: number }>>(true);

    assert.deepStrictEqual(arrayResult, [[3], [4]]);
    assert.deepStrictEqual(objectResult, [{ val: 3 }, { val: 4 }]);
  });

  it("Does not find component value on specific entity if it does not have it", () => {
    // Arrange
    const { all, entities, components: { Number1 } } = createEntities({ count: 4 });

    // Act
    const arrayResult = query(all, [Number1.on(entities[0])]);
    const objectResult = query(all, { val: Number1.on(entities[0]) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: number }>>(true);

    assert.deepStrictEqual(arrayResult, []);
    assert.deepStrictEqual(objectResult, []);
  });

  it("Does not find component value on specific entity if entity not in list", () => {
    // Arrange
    const { all, entities, components: { Number1 } } = createEntities({ count: 4 });
    const entity = new Entity();
    entity.add(Number1.withValue(1));

    // Act
    const arrayResult = query(all, [Number1.on(entity)]);
    const objectResult = query(all, { val: Number1.on(entity) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: number }>>(true);

    assert.deepStrictEqual(arrayResult, []);
    assert.deepStrictEqual(objectResult, []);
  });

  it("Does not find anything if query only has partial match", () => {
    // Arrange
    const { all, entities, components: { Number1, Number2 } } = createEntities({ count: 3 });
    entities[1].add(Number1.withValue(1));

    // Act
    const arrayResult = query(all, [Number1, Number2]);
    const objectResult = query(all, { val1: Number1, val2: Number2 });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number, number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val1: number, val2: number }>>(true);

    assert.deepStrictEqual(arrayResult, []);
    assert.deepStrictEqual(objectResult, []);
  });
});

describe("Component wildcard query", () => {
  it("Finds all components", () => {
    // Arrange
    const { all, entities, components } = createEntities({ count: 3 });

    entities[1].add(components.Tag1);
    entities[2].add(components.Number1.withValue(1), components.Tag2);

    const expectedArray = [[undefined], [1], [undefined]];
    const expectedObject = expectedArray.map((val) => ({ comp: val }));

    // Act
    const arrayResult = query(all, [Component]);
    const objectResult = query(all, { comp: Component });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[unknown]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ comp: unknown }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds components on specific entity", () => {
    // Arrange
    const { all, entities, components } = createEntities({ count: 2 });

    entities[1].add(components.Tag1, components.Number1.withValue(1));
    entities[2].add(components.Number1.withValue(2));

    const expectedArray = [[undefined], [1]];
    const expectedObject = expectedArray.map((comp) => ({ comp }));

    // Act
    const arrayResult = query(all, [Component.on(entities[1])]);
    const objectResult = query(all, { comp: Component.on(entities[1]) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[unknown]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ comp: unknown }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds components on referenced entity", () => {
    // Arrange
    const { all, entities, components } = createEntities({ count: 3 });
    entities[1].add(components.Tag1);
    entities[2].add(components.Number1.withValue(1), components.Tag2);
    const expectedArray = [
      [entities[1], undefined],
      [entities[2], 1],
    ];
    const expectedObject = expectedArray.map(([ent, comp]) => ({ ent, comp }));

    // Act
    const arrayResult = query(all, [Entity.as("ref").once(), Component.on("ref")]);
    const objectResult = query(all, { ent: Entity.as("ref").once(), comp: Component.on("ref") });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Entity, unknown]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ ent: Entity, comp: unknown }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds components on any entity", () => {
    // Arrange
    const { all, entities, components } = createEntities({ count: 3 });

    entities[1].add(components.Tag1);
    entities[2].add(components.Number1.withValue(1), components.Tag2);

    const expectedArray = [[undefined], [1], [undefined]];
    const expectedObject = expectedArray.map((val) => ({ comp: val }));

    // Act
    const arrayResult = query(all, [Component.on(Entity)]);
    const objectResult = query(all, { comp: Component.on(Entity) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[unknown]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ comp: unknown }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds all components on any component", () => {
    // Arrange
    const { all, entities, components } = createEntities({ count: 3 });

    entities[1].add(components.Number1.withValue(0));
    components.Tag1.add(components.Number1.withValue(1), components.Tag2);
    components.Number2.add(components.Number1.withValue(2));

    const expectedArray = [[1], [undefined], [2]];
    const expectedObject = expectedArray.map((val) => ({ comp: val }));

    // Act
    const arrayResult = query(all, [Component.on(Component)]);
    const objectResult = query(all, { comp: Component.on(Component) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[unknown]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ comp: unknown }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds all components on any relationship", () => {
    // Arrange
    const { all, entities, components, relationships } = createEntities({ count: 3 });

    entities[1].add(components.Number1.withValue(0));
    components.Number1.add(components.Number1.withValue(1));
    relationships.Tag1.add(components.Number1.withValue(2), components.Tag2);
    relationships.Number2.add(components.Number1.withValue(3));

    const expectedArray = [[2], [undefined], [3]];
    const expectedObject = expectedArray.map((val) => ({ comp: val }));

    // Act
    const arrayResult = query(all, [Component.on(Relationship)]);
    const objectResult = query(all, { comp: Component.on(Relationship) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[unknown]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ comp: unknown }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify reference name for found component (not for found values)", () => {
    // Arrange
    const { all, entities, components } = createEntities({ count: 3 });

    entities[0].add(components.Number1.withValue(1));
    entities[0].add(components.Number2.withValue(2));
    components.Number1.add(components.Number2.withValue(3));
    components.String1.add(components.Number2.withValue(4));

    const expectedArray = [[1, 3]];
    const expectedObject = expectedArray.map(([comp1, comp2]) => ({ comp1, comp2 }));

    // Act
    const arrayResult = query(all, [Component.as("comp"), Component.on("comp")]);
    const objectResult = query(all, { comp1: Component.as("comp"), comp2: Component.on("comp") });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[unknown, unknown]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ comp1: unknown, comp2: unknown }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can find the same component multiple times", () => {
    // Arrange
    const { all, entities, components } = createEntities({ count: 3 });

    entities[0].add(components.Number1.withValue(1));
    entities[0].add(components.Number2.withValue(2));
    entities[1].add(components.Number1.withValue(3));

    const expectedArray = [
      [1, 1],
      [1, 2],
      [2, 1],
      [2, 2],
    ];
    const expectedObject = expectedArray.map(([comp1, comp2]) => ({ comp1, comp2 }));

    // Act
    const arrayResult = query(all, [Component, Component]);
    const objectResult = query(all, { comp1: Component, comp2: Component });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[unknown, unknown]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ comp1: unknown, comp2: unknown }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify that a given component type may only be found once", () => {
    // Arrange
    const { all, entities, components } = createEntities({ count: 3 });

    entities[0].add(components.Number1.withValue(1));
    entities[0].add(components.Number2.withValue(2));
    entities[1].add(components.Number1.withValue(3));

    const expectedArray = [
      [1, 1],
      [2, 1],
    ];
    const expectedObject = expectedArray.map(([comp1, comp2]) => ({ comp1, comp2 }));

    // Act
    const arrayResult = query(all, [Component.once(), Component]);
    const objectResult = query(all, { comp1: Component.once(), comp2: Component });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[unknown, unknown]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ comp1: unknown, comp2: unknown }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });
});

describe("Component type query", () => {
  it("Find all component types", () => {
    // Arrange
    const { all, components } = createEntities({ count: 3 });

    const expectedArray = Object.values(components).map((component) => [component]);
    const expectedObject = expectedArray.map((comp) => ({ comp }));

    // Act
    const arrayResult = query(all, [Component.type()]);
    const objectResult = query(all, { comp: Component.type() });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Component<unknown>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ comp: Component<unknown> }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify reference name of component type", () => {
    // Arrange
    const { all, components } = createEntities({ count: 3 });

    const expectedArray = Object.values(components).map((component) => [component]);
    const expectedObject = expectedArray.map((comp) => ({ comp }));

    // Act
    const arrayResult = query(all, [Component.type().as("comp")]);
    const objectResult = query(all, { comp: Component.type().as("comp") });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Component<unknown>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ comp: Component<unknown> }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can use component type reference to find components of type", () => {
    // Arrange
    const { all, components, entities } = createEntities({ count: 3 });

    entities[0].add(components.Number1.withValue(1));
    entities[1].add(components.Tag1);

    const expectedArray = [
      [components.Number1, 1],
      [components.Tag1, undefined],
    ];
    const expectedObject = expectedArray.map(([comp, val]) => ({ comp, val }));

    // Act
    const arrayResult = query(all, [Component.type().as("type"), Component.as("type")]);
    const objectResult = query(all, { comp: Component.type().as("type"), val: Component.as("type") });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Component<unknown>, unknown]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ comp: Component<unknown>, val: unknown }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can find the same component type multiple times", () => {
    // Arrange
    const { all, components } = createEntities({ count: 3 });

    const expectedArray = [
      [components.Number1, components.Number1],
      [components.Number1, components.Number2],
      [components.Number2, components.Number1],
      [components.Number2, components.Number2],
    ];
    const expectedObject = expectedArray.map(([comp1, comp2]) => ({ comp1, comp2 }));

    // Act
    const arrayResult = query(all, [Component.type(), Component.type()]);
    const objectResult = query(all, { comp1: Component.type(), comp2: Component.type() });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Component<unknown>, Component<unknown>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ comp1: Component<unknown>, comp2: Component<unknown> }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify that a given component type may only be found once", () => {
    // Arrange
    const { all, components } = createEntities({ count: 3 });

    const expectedArray = [
      [components.Number1, components.Number1],
      [components.Number2, components.Number1],
    ];
    const expectedObject = expectedArray.map(([comp1, comp2]) => ({ comp1, comp2 }));

    // Act
    const arrayResult = query(all, [Component.type().once(), Component.type()]);
    const objectResult = query(all, { comp1: Component.type().once(), comp2: Component.type() });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Component<unknown>, Component<unknown>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ comp1: Component<unknown>, comp2: Component<unknown> }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify source entity of component type", () => {
    // Arrange
    const { all, components: { Number1, Number2 }, entities } = createEntities({ count: 3 });

    entities[0].add(Number1.withValue(1));
    entities[1].add(Number1.withValue(2));
    entities[1].add(Number2.withValue(3));

    const expectedArray = [[Number1], [Number2]];
    const expectedObject = expectedArray.map(([comp, val]) => ({ comp, val }));

    // Act
    const arrayResult = query(all, [Component.type().on(entities[1])]);
    const objectResult = query(all, { comp: Component.type().on(entities[1]) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Component<unknown>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ comp: Component<unknown> }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify source reference of component type", () => {
    // Arrange
    const { all, components: { Number1, Number2 }, entities } = createEntities({ count: 3 });

    entities[0].add(Number1.withValue(1));
    entities[1].add(Number1.withValue(2));
    entities[1].add(Number2.withValue(3));

    const expectedArray = [
      [2, Number1],
      [2, Number2],
    ];
    const expectedObject = expectedArray.map(([comp, val]) => ({ comp, val }));

    // Act
    const arrayResult = query(all, [Number2.on("ent"), Component.type().on("ent")]);
    const objectResult = query(all, { val: Number2.on("ent"), type: Component.type().on("ent") });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number, Component<unknown>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: number, type: Component<unknown> }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify entity wildcard as source of component type", () => {
    // Arrange
    const { all, components: { Number1, Number2 }, entities } = createEntities({ count: 3 });

    entities[0].add(Number1.withValue(1));
    entities[1].add(Number1.withValue(2));
    entities[1].add(Number2.withValue(3));

    const expectedArray = [
      [Number1],
      [Number1],
      [Number2],
    ];
    const expectedObject = expectedArray.map(([comp, val]) => ({ comp, val }));

    // Act
    const arrayResult = query(all, [Component.type().on(Entity)]);
    const objectResult = query(all, { type: Component.type().on(Entity) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Component<unknown>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ type: Component<unknown> }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify component wildcard as source of component type", () => {
    // Arrange
    const { all, components: { Number1, Number2 }, entities } = createEntities({ count: 3 });

    entities[0].add(Number1.withValue(1));
    Number1.add(Number1.withValue(2));
    Number2.add(Number1.withValue(3));

    const expectedArray = [
      [Number1],
      [Number1],
    ];
    const expectedObject = expectedArray.map(([comp, val]) => ({ comp, val }));

    // Act
    const arrayResult = query(all, [Component.type().on(Component)]);
    const objectResult = query(all, { type: Component.type().on(Component) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Component<unknown>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ type: Component<unknown> }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify relationship wildcard as source of component type", () => {
    // Arrange
    const { all, components: { Number1, Number2 }, relationships: { Tag1 } } = createEntities({ count: 3 });

    Tag1.add(Number1.withValue(1));
    Number1.add(Number1.withValue(2));
    Number2.add(Number1.withValue(3));

    const expectedArray = [
      [Number1],
    ];
    const expectedObject = expectedArray.map(([comp, val]) => ({ comp, val }));

    // Act
    const arrayResult = query(all, [Component.type().on(Relationship)]);
    const objectResult = query(all, { type: Component.type().on(Relationship) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Component<unknown>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ type: Component<unknown> }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });
});

describe("Relationship instance query", () => {
  it("Finds tag relationship on entities", () => {
    // Arrange
    const { all, entities, relationships: { Tag1, Tag2 } } = createEntities({ count: 3 });

    entities[0].add(Tag1.to(entities[1]));
    entities[1].add(Tag1.to(entities[2]));
    entities[1].add(Tag2.to(entities[0]));

    const expectedArray = [[Tag1], [Tag1]];
    const expectedObject = expectedArray.map((rel) => ({ rel }));

    // Act
    const arrayResult = query(all, [Tag1]);
    const objectResult = query(all, { rel: Tag1 });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[undefined]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ rel: undefined }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds value relationship on entities", () => {
    // Arrange
    const { all, entities, relationships: { Number1, Number2 } } = createEntities({ count: 3 });

    entities[0].add(Number1.to(entities[1]).withValue(1));
    entities[1].add(Number1.to(entities[2]).withValue(2));
    entities[1].add(Number2.to(entities[0]).withValue(3));

    const expectedArray = [[1], [2]];
    const expectedObject = expectedArray.map((rel) => ({ rel }));

    // Act
    const arrayResult = query(all, [Number1]);
    const objectResult = query(all, { rel: Number1 });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ rel: number }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can require multiple different relationship values in single query", () => {
    // Arrange
    const { all, entities, relationships: { Number1, Number2 } } = createEntities({ count: 3 });

    entities[0].add(Number1.to(entities[1]).withValue(1));
    entities[1].add(Number1.to(entities[2]).withValue(2));
    entities[1].add(Number2.to(entities[0]).withValue(3));

    // Act
    const arrayResult = query(all, [Number1, Number2]);
    const objectResult = query(all, { val1: Number1, val2: Number2 });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number, number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val1: number, val2: number }>>(true);

    assert.deepStrictEqual(arrayResult, [[2, 3]]);
    assert.deepStrictEqual(objectResult, [{ val1: 2, val2: 3 }]);
  });

  it("Does not find relationship value if not on an entity", () => {
    // Arrange
    const { all, relationships: { Number1 } } = createEntities({ count: 3 });

    // Act
    const arrayResult = query(all, [Number1]);
    const objectResult = query(all, { val: Number1 });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: number }>>(true);

    assert.deepStrictEqual(arrayResult, []);
    assert.deepStrictEqual(objectResult, []);
  });

  it("Finds relationship value on specific entity", () => {
    // Arrange
    const { all, entities, relationships: { Number1, Number2 } } = createEntities({ count: 3 });

    entities[0].add(Number1.to(entities[1]).withValue(1));
    entities[0].add(Number2.to(entities[0]).withValue(2));
    entities[1].add(Number1.to(entities[2]).withValue(3));

    const expectedArray = [[1]];
    const expectedObject = expectedArray.map((rel) => ({ rel }));

    // Act
    const arrayResult = query(all, [Number1.on(entities[0])]);
    const objectResult = query(all, { val: Number1.on(entities[0]) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: number }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds relationship value on entity reference", () => {
    // Arrange
    const { all, entities, relationships: { Number1, Number2 } } = createEntities({ count: 3 });

    entities[0].add(Number1.to(entities[1]).withValue(1));
    entities[0].add(Number2.to(entities[0]).withValue(2));
    entities[1].add(Number1.to(entities[2]).withValue(3));

    const expectedArray = [[entities[0], 1], [entities[1], 3]];
    const expectedObject = expectedArray.map((rel) => ({ rel }));

    // Act
    const arrayResult = query(all, [Entity.as("ref"), Number1.on("ref")]);
    const objectResult = query(all, { ent: Entity.as("ref"), val: Number1.on("ref") });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Entity, number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ ent: Entity, val: number }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds relationship value on any entity using wildcard", () => {
    // Arrange
    const { all, entities, relationships: { Number1, Number2 } } = createEntities({ count: 3 });

    entities[0].add(Number1.to(entities[1]).withValue(1));
    entities[0].add(Number2.to(entities[0]).withValue(2));
    entities[1].add(Number1.to(entities[2]).withValue(3));

    const expectedArray = [[1], [3]];
    const expectedObject = expectedArray.map((rel) => ({ rel }));

    // Act
    const arrayResult = query(all, [Number1.on(Entity)]);
    const objectResult = query(all, { val: Number1.on(Entity) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: number }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds relationship value on any component type using wildcard", () => {
    // Arrange
    const {
      all,
      entities,
      components: { Tag1, String1 },
      relationships: { Number1, Number2 },
    } = createEntities({ count: 3 });

    entities[0].add(Number1.to(Tag1).withValue(1));
    Tag1.add(Number1.to(Tag1).withValue(1));
    Tag1.add(Number2.to(Tag1).withValue(2));
    String1.add(Number1.to(Tag1).withValue(3));

    const expectedArray = [[1], [3]];
    const expectedObject = expectedArray.map((rel) => ({ rel }));

    // Act
    const arrayResult = query(all, [Number1.on(Component)]);
    const objectResult = query(all, { val: Number1.on(Component) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: number }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds relationship value on any relationship type using wildcard", () => {
    // Arrange
    const {
      all,
      entities,
      components,
      relationships: { Number1, Number2, Tag1, String1 },
    } = createEntities({ count: 3 });

    entities[0].add(Number1.to(Tag1).withValue(1));
    components.Number1.add(Number1.to(Tag1).withValue(2));
    Tag1.add(Number1.to(Tag1).withValue(3));
    Tag1.add(Number2.to(Tag1).withValue(4));
    String1.add(Number1.to(Tag1).withValue(5));

    const expectedArray = [[3], [5]];
    const expectedObject = expectedArray.map((rel) => ({ rel }));

    // Act
    const arrayResult = query(all, [Number1.on(Relationship)]);
    const objectResult = query(all, { val: Number1.on(Relationship) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: number }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds relationship value to specific entity", () => {
    // Arrange
    const { all, entities, relationships: { Number1, Number2 } } = createEntities({ count: 3 });

    entities[0].add(Number1.to(entities[1]).withValue(1));
    entities[1].add(Number1.to(entities[0]).withValue(2));
    entities[1].add(Number2.to(entities[1]).withValue(3));

    const expectedArray = [[1]];
    const expectedObject = expectedArray.map((rel) => ({ rel }));

    // Act
    const arrayResult = query(all, [Number1.to(entities[1])]);
    const objectResult = query(all, { val: Number1.to(entities[1]) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: number }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds relationship value to entity reference", () => {
    // Arrange
    const { all, entities, relationships: { Number1, Number2 } } = createEntities({ count: 3 });

    entities[0].add(Number1.to(entities[1]).withValue(1));
    entities[1].add(Number1.to(entities[0]).withValue(2));
    entities[1].add(Number2.to(entities[1]).withValue(3));

    const expectedArray = [[entities[1], 1], [entities[0], 2]];
    const expectedObject = expectedArray.map(([ent, val]) => ({ ent, val }));

    // Act
    const arrayResult = query(all, [Entity.as("ref"), Number1.to("ref")]);
    const objectResult = query(all, { ent: Entity.as("ref"), val: Number1.to("ref") });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Entity, number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ ent: Entity, val: number }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds relationship value to any entity using wildcard", () => {
    // Arrange
    const { all, entities, relationships: { Number1, Number2 } } = createEntities({ count: 3 });

    entities[0].add(Number1.to(entities[1]).withValue(1));
    entities[1].add(Number1.to(entities[0]).withValue(2));
    entities[1].add(Number2.to(entities[1]).withValue(3));

    const expectedArray = [[1], [2]];
    const expectedObject = expectedArray.map((rel) => ({ rel }));

    // Act
    const arrayResult = query(all, [Number1.to(Entity)]);
    const objectResult = query(all, { val: Number1.to(Entity) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: number }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds relationship value to any component type using wildcard", () => {
    // Arrange
    const {
      all,
      entities,
      components: { Tag1, String1 },
      relationships: { Number1, Number2 },
    } = createEntities({ count: 3 });

    entities[0].add(Number1.to(Tag1).withValue(1));
    Tag1.add(Number1.to(Tag1).withValue(2));
    Tag1.add(Number2.to(Tag1).withValue(3));
    String1.add(Number1.to(Tag1).withValue(4));
    Number1.add(Number1.to(Tag1).withValue(5));
    Tag1.add(Number1.to(entities[0]).withValue(6));
    Tag1.add(Number1.to(Number1).withValue(7));
    Tag1.add(Number1.to(Number1.to(entities[0])).withValue(8));

    const expectedArray = [[1], [2], [4]]
    const expectedObject = expectedArray.map((rel) => ({ rel }));

    // Act
    const arrayResult = query(all, [Number1.to(Component)]);
    const objectResult = query(all, { val: Number1.to(Component) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: number }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds relationship value to any relationship type using wildcard", () => {
    // Arrange
    const {
      all,
      entities,
      components: { Tag1, String1 },
      relationships: { Number1, Number2 },
    } = createEntities({ count: 3 });

    entities[0].add(Number1.to(Tag1).withValue(1));
    Tag1.add(Number1.to(Tag1).withValue(2));
    Tag1.add(Number2.to(Tag1).withValue(3));
    String1.add(Number1.to(Tag1).withValue(4));
    Number1.add(Number1.to(Tag1).withValue(5));
    Tag1.add(Number1.to(entities[0]).withValue(6));
    Tag1.add(Number1.to(Number1).withValue(7));
    Tag1.add(Number1.to(Number1.to(entities[0])).withValue(8));
    Number1.add(Number1.to(Number1).withValue(9));

    const expectedArray = [[7], [9]]
    const expectedObject = expectedArray.map((rel) => ({ rel }));

    // Act
    const arrayResult = query(all, [Number1.to(Relationship)]);
    const objectResult = query(all, { val: Number1.to(Relationship) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: number }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Does not find relationship value on specific entity if it does not have it", () => {
    // Arrange
    const { all, entities, relationships: { Number1, Number2 } } = createEntities({ count: 3 });

    entities[0].add(Number1.to(entities[1]).withValue(1));
    entities[1].add(Number1.to(entities[0]).withValue(2));
    entities[1].add(Number2.to(entities[1]).withValue(3));

    // Act
    const arrayResult = query(all, [Number1.on(entities[2])]);
    const objectResult = query(all, { val: Number1.on(entities[2]) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: number }>>(true);

    assert.deepStrictEqual(arrayResult, []);
    assert.deepStrictEqual(objectResult, []);
  });

  it("Does not find relationship value to specific entity if it does not have it", () => {
    // Arrange
    const { all, entities, relationships: { Number1, Number2 } } = createEntities({ count: 3 });

    entities[0].add(Number1.to(entities[1]).withValue(1));
    entities[1].add(Number1.to(entities[0]).withValue(2));
    entities[1].add(Number2.to(entities[1]).withValue(3));

    // Act
    const arrayResult = query(all, [Number1.to(entities[2])]);
    const objectResult = query(all, { val: Number1.to(entities[2]) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: number }>>(true);

    assert.deepStrictEqual(arrayResult, []);
    assert.deepStrictEqual(objectResult, []);
  });

  it("Does not find relationship value on specific entity if entity not in list", () => {
    // Arrange
    const { all, entities, relationships: { Number1 } } = createEntities({ count: 1 });

    const entity = new Entity();
    entity.add(Number1.to(entities[0]).withValue(1));

    // Act
    const arrayResult = query(all, [Number1.on(entity)]);
    const objectResult = query(all, { val: Number1.on(entity) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: number }>>(true);

    assert.deepStrictEqual(arrayResult, []);
    assert.deepStrictEqual(objectResult, []);
  });

  it("Finds entity with explicit relationship to self", () => {
    // Arrange
    const { all, entities, relationships: { Number1 } } = createEntities({ count: 1 });

    entities[0].add(Number1.to(entities[0]).withValue(1));

    const expectedArray = [[1]];
    const expectedObject = expectedArray.map((rel) => ({ rel }));

    // Act
    const arrayResult = query(all, [Number1.to(entities[0])]);
    const objectResult = query(all, { val: Number1.to(entities[0]) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: number }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds relationship with explicit relationship to self using instance", () => {
    // Arrange
    const { all, relationships: { Number1 } } = createEntities({ count: 1 });

    Number1.add(Number1.to(Number1).withValue(1));

    const expectedArray = [[1]];
    const expectedObject = expectedArray.map((rel) => ({ rel }));

    // Act
    const arrayResult = query(all, [Number1.to(Number1)]);
    const objectResult = query(all, { val: Number1.to(Number1) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: number }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds relationship to self by reference", () => {
    // Arrange
    const { all, relationships: { Number1 } } = createEntities({ count: 1 });

    Number1.add(Number1.to(Number1).withValue(1));

    const expectedArray = [[1, Number1]];
    const expectedObject = expectedArray.map(([rel, target]) => ({ rel, target }));

    // Act
    const arrayResult = query(all, [Number1.to("target"), Entity.as("target")]);
    const objectResult = query(all, { val: Number1.to("target"), target: Entity.as("target") });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number, Entity]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: number, target: Entity }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds transitive relationship to self by reference", () => {
    // Arrange
    const { all, entities, relationships: { Number1 } } = createEntities({ count: 1 });

    Number1.add(Number1.to(entities[0]).withValue(1));
    entities[0].add(Number1.to(Number1).withValue(2));

    const expectedArray = [[1, 2]];
    const expectedObject = expectedArray.map(([rel1, rel2]) => ({ rel1, rel2 }));

    // Act
    const arrayResult = query(all, [
      Number1.on("source").to("target"),
      Number1.on("target").to("source"),
    ]);
    const objectResult = query(all, {
      rel1: Number1.on("source").to("target"),
      rel2: Number1.on("target").to("source"),
    });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number, number]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ rel1: number, rel2: number }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });
});

describe("Relationship wildcard query", () => {
  it("Finds all relationships", () => {
    // Arrange
    const { all, entities, relationships: { Tag1, Number1 } } = createEntities({ count: 3 });

    entities[0].add(Tag1.to(entities[1]));
    entities[1].add(Tag1.to(entities[2]));
    entities[1].add(Number1.to(entities[0]).withValue(1));

    const expectedArray = [[Tag1], [Tag1], [Number1]];
    const expectedObject = expectedArray.map((rel) => ({ rel }));

    // Act
    const arrayResult = query(all, [Relationship]);
    const objectResult = query(all, { rel: Relationship });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[any]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ rel: any }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds all relationships on specific entity", () => {
    // Arrange
    const { all, entities, relationships: { Number1, Number2 } } = createEntities({ count: 3 });

    entities[0].add(Number1.to(entities[1]).withValue(1));
    entities[0].add(Number2.to(entities[0]).withValue(2));
    entities[1].add(Number1.to(entities[2]).withValue(3));

    const expectedArray = [[1]];
    const expectedObject = expectedArray.map((rel) => ({ rel }));

    // Act
    const arrayResult = query(all, [Relationship.on(entities[0])]);
    const objectResult = query(all, { val: Relationship.on(entities[0]) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[unknown]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: unknown }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds all relationships on referenced entity", () => {
    // Arrange
    const { all, entities, relationships: { Number1, Number2 } } = createEntities({ count: 3 });

    entities[0].add(Number1.to(entities[1]).withValue(1));
    entities[0].add(Number2.to(entities[0]).withValue(2));
    entities[1].add(Number1.to(entities[2]).withValue(3));

    const expectedArray = [[entities[0], 1], [entities[1], 3]];
    const expectedObject = expectedArray.map((rel) => ({ rel }));

    // Act
    const arrayResult = query(all, [Entity.as("ref"), Relationship.on("ref")]);
    const objectResult = query(all, { ent: Entity.as("ref"), val: Relationship.on("ref") });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Entity, unknown]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ ent: Entity, val: unknown }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds all relationships on any entity", () => {
    // Arrange
    const { all, entities, relationships: { Number1, Number2 } } = createEntities({ count: 3 });

    entities[0].add(Number1.to(entities[1]).withValue(1));
    entities[0].add(Number2.to(entities[0]).withValue(2));
    entities[1].add(Number1.to(entities[2]).withValue(3));

    const expectedArray = [[1], [3]];
    const expectedObject = expectedArray.map((rel) => ({ rel }));

    // Act
    const arrayResult = query(all, [Relationship.on(Entity)]);
    const objectResult = query(all, { val: Relationship.on(Entity) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[unknown]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: unknown }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds all relationships on any component", () => {
    // Arrange
    const {
      all,
      entities,
      components: { Tag1, String1 },
      relationships: { Number1, Number2 },
    } = createEntities({ count: 3 });

    entities[0].add(Number1.to(Tag1).withValue(1));
    Tag1.add(Number1.to(Tag1).withValue(1));
    Tag1.add(Number2.to(Tag1).withValue(2));
    String1.add(Number1.to(Tag1).withValue(3));

    const expectedArray = [[1], [3]];
    const expectedObject = expectedArray.map((rel) => ({ rel }));

    // Act
    const arrayResult = query(all, [Relationship.on(Component)]);
    const objectResult = query(all, { val: Relationship.on(Component) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[unknown]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: unknown }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds all relationships on any relationship", () => {
    // Arrange
    const {
      all,
      entities,
      components,
      relationships: { Number1, Number2, Tag1, String1 },
    } = createEntities({ count: 3 });

    entities[0].add(Number1.to(Tag1).withValue(1));
    components.Number1.add(Number1.to(Tag1).withValue(2));
    Tag1.add(Number1.to(Tag1).withValue(3));
    Tag1.add(Number2.to(Tag1).withValue(4));
    String1.add(Number1.to(Tag1).withValue(5));

    const expectedArray = [[3], [5]];
    const expectedObject = expectedArray.map((rel) => ({ rel }));

    // Act
    const arrayResult = query(all, [Relationship.on(Relationship)]);
    const objectResult = query(all, { val: Relationship.on(Relationship) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[unknown]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: unknown }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds all relationships to specific entity", () => {
    // Arrange
    const { all, entities, relationships: { Number1, Number2 } } = createEntities({ count: 3 });

    entities[0].add(Number1.to(entities[1]).withValue(1));
    entities[1].add(Number1.to(entities[0]).withValue(2));
    entities[1].add(Number2.to(entities[1]).withValue(3));

    const expectedArray = [[1]];
    const expectedObject = expectedArray.map((rel) => ({ rel }));

    // Act
    const arrayResult = query(all, [Relationship.to(entities[1])]);
    const objectResult = query(all, { val: Relationship.to(entities[1]) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[unknown]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: unknown }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds all relationships to referenced entity", () => {
    // Arrange
    const { all, entities, relationships: { Number1, Number2 } } = createEntities({ count: 3 });

    entities[0].add(Number1.to(entities[1]).withValue(1));
    entities[1].add(Number1.to(entities[0]).withValue(2));
    entities[1].add(Number2.to(entities[1]).withValue(3));

    const expectedArray = [[entities[1], 1], [entities[0], 2]];
    const expectedObject = expectedArray.map(([ent, val]) => ({ ent, val }));

    // Act
    const arrayResult = query(all, [Entity.as("ref"), Relationship.to("ref")]);
    const objectResult = query(all, { ent: Entity.as("ref"), val: Relationship.to("ref") });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Entity, unknown]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ ent: Entity, val: unknown }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds all relationships to any entity", () => {
    // Arrange
    const { all, entities, relationships: { Number1, Number2 } } = createEntities({ count: 3 });

    entities[0].add(Number1.to(entities[1]).withValue(1));
    entities[1].add(Number1.to(entities[0]).withValue(2));
    entities[1].add(Number2.to(entities[1]).withValue(3));

    const expectedArray = [[1], [2]];
    const expectedObject = expectedArray.map((rel) => ({ rel }));

    // Act
    const arrayResult = query(all, [Relationship.to(Entity)]);
    const objectResult = query(all, { val: Relationship.to(Entity) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[unknown]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: unknown }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds all relationships to any component", () => {
    // Arrange
    const {
      all,
      entities,
      components: { Tag1, String1 },
      relationships: { Number1, Number2 },
    } = createEntities({ count: 3 });

    entities[0].add(Number1.to(Tag1).withValue(1));
    Tag1.add(Number1.to(Tag1).withValue(2));
    Tag1.add(Number2.to(Tag1).withValue(3));
    String1.add(Number1.to(Tag1).withValue(4));
    Number1.add(Number1.to(Tag1).withValue(5));
    Tag1.add(Number1.to(entities[0]).withValue(6));
    Tag1.add(Number1.to(Number1).withValue(7));
    Tag1.add(Number1.to(Number1.to(entities[0])).withValue(8));

    const expectedArray = [[1], [2], [4]]
    const expectedObject = expectedArray.map((rel) => ({ rel }));

    // Act
    const arrayResult = query(all, [Relationship.to(Component)]);
    const objectResult = query(all, { val: Relationship.to(Component) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[unknown]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: unknown }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds all relationships to any relationship", () => {
    // Arrange
    const {
      all,
      entities,
      components: { Tag1, String1 },
      relationships: { Number1, Number2 },
    } = createEntities({ count: 3 });

    entities[0].add(Number1.to(Tag1).withValue(1));
    Tag1.add(Number1.to(Tag1).withValue(2));
    Tag1.add(Number2.to(Tag1).withValue(3));
    String1.add(Number1.to(Tag1).withValue(4));
    Number1.add(Number1.to(Tag1).withValue(5));
    Tag1.add(Number1.to(entities[0]).withValue(6));
    Tag1.add(Number1.to(Number1).withValue(7));
    Tag1.add(Number1.to(Number1.to(entities[0])).withValue(8));
    Number1.add(Number1.to(Number1).withValue(9));

    const expectedArray = [[7], [9]]
    const expectedObject = expectedArray.map((rel) => ({ rel }));

    // Act
    const arrayResult = query(all, [Relationship.to(Relationship)]);
    const objectResult = query(all, { val: Relationship.to(Relationship) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[unknown]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: unknown }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify reference name for found relationship (not for found values)", () => {
    // Arrange
    const { all, entities, relationships: { Number1, Number2 } } = createEntities({ count: 3 });

    entities[0].add(Number1.to(entities[1]).withValue(1));
    entities[0].add(Number2.to(entities[0]).withValue(2));
    entities[1].add(Number1.to(entities[2]).withValue(3));

    const expectedArray = [[1], [3]];
    const expectedObject = expectedArray.map((rel) => ({ rel }));

    // Act
    const arrayResult = query(all, [Relationship.as("rel").on(Entity)]);
    const objectResult = query(all, { rel: Relationship.as("rel").on(Entity) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[unknown]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ rel: unknown }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can find the same relationship multiple times", () => {
    // Arrange
    const { all, entities, relationships: { Number1 } } = createEntities({ count: 3 });

    entities[0].add(Number1.to(entities[1]).withValue(1));
    entities[0].add(Number1.to(entities[2]).withValue(2));

    const expectedArray = [[1, 1], [1, 2], [2, 1], [2, 2]];
    const expectedObject = expectedArray.map((rel) => ({ rel }));

    // Act
    const arrayResult = query(all, [Relationship.on(Entity), Relationship.on(Entity)]);
    const objectResult = query(all, { val1: Relationship.on(Entity), val2: Relationship.on(Entity) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[unknown, unknown]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val1: unknown, val2: unknown }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify that a given relationship type may only be found once", () => {
    // Arrange
    const { all, entities, relationships: { Number1 } } = createEntities({ count: 3 });

    entities[0].add(Number1.to(entities[1]).withValue(1));
    entities[0].add(Number1.to(entities[2]).withValue(2));

    const expectedArray = [[1, 1], [2, 1]];
    const expectedObject = expectedArray.map((rel) => ({ rel }));

    // Act
    const arrayResult = query(all, [Relationship.on(Entity).once(), Relationship.on(Entity)]);
    const objectResult = query(all, { val1: Relationship.on(Entity).once(), val2: Relationship.on(Entity) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[unknown, unknown]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val1: unknown, val2: unknown }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Does not find relationship value on specific entity if entity not in list", () => {
    // Arrange
    const { all, entities, relationships: { Number1 } } = createEntities({ count: 1 });

    const entity = new Entity();
    entity.add(Number1.to(entities[0]).withValue(1));

    // Act
    const arrayResult = query(all, [Relationship.on(entity)]);
    const objectResult = query(all, { val: Relationship.on(entity) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[unknown]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: unknown }>>(true);

    assert.deepStrictEqual(arrayResult, []);
    assert.deepStrictEqual(objectResult, []);
  });

  it("Finds entity with explicit relationship to self", () => {
    // Arrange
    const { all, entities, relationships: { Number1 } } = createEntities({ count: 1 });

    entities[0].add(Number1.to(entities[0]).withValue(1));

    const expectedArray = [[1]];
    const expectedObject = expectedArray.map((rel) => ({ rel }));

    // Act
    const arrayResult = query(all, [Relationship.to(entities[0])]);
    const objectResult = query(all, { val: Relationship.to(entities[0]) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[unknown]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: unknown }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds relationship with explicit relationship to self using wildcard", () => {
    // Arrange
    const { all, relationships: { Number1 } } = createEntities({ count: 1 });

    Number1.add(Number1.to(Number1).withValue(1));

    const expectedArray = [[1]];
    const expectedObject = expectedArray.map((rel) => ({ rel }));

    // Act
    const arrayResult = query(all, [Relationship.to(Relationship)]);
    const objectResult = query(all, { val: Relationship.to(Relationship) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[unknown]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: unknown }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds relationship to self by reference", () => {
    // Arrange
    const { all, relationships: { Number1 } } = createEntities({ count: 1 });

    Number1.add(Number1.to(Number1).withValue(1));

    const expectedArray = [[1, Number1]];
    const expectedObject = expectedArray.map(([rel, target]) => ({ rel, target }));

    // Act
    const arrayResult = query(all, [Relationship.to("target"), Relationship.type().as("target")]);
    const objectResult = query(all, { val: Relationship.to("target"), target: Relationship.type().as("target") });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[any, Relationship<unknown>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: any, target: Relationship<unknown> }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds transitive relationship to self by reference", () => {
    // Arrange
    const { all, entities, relationships: { Number1 } } = createEntities({ count: 1 });

    Number1.add(Number1.to(entities[0]).withValue(1));
    entities[0].add(Number1.to(Number1).withValue(2));

    const expectedArray = [[1, 2]];
    const expectedObject = expectedArray.map(([rel1, rel2]) => ({ rel1, rel2 }));

    // Act
    const arrayResult = query(all, [
      Relationship.on("source").to("target"),
      Relationship.on("target").to("source"),
    ]);
    const objectResult = query(all, {
      rel1: Relationship.on("source").to("target"),
      rel2: Relationship.on("target").to("source"),
    });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[unknown, unknown]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ rel1: unknown, rel2: unknown }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });
});

describe("Relationship type query", () => {
  it("Find all relationship types", () => {
    // Arrange
    const { all, entities, relationships: { Tag1, Number1, String1 } } = createEntities({ count: 3 });

    entities[0].add(Tag1.to(entities[1]));
    entities[1].add(Number1.to(entities[1]).withValue(1));
    entities[2].add(String1.to(entities[1]).withValue("hello"));

    const expectedArray = [[Tag1], [Number1], [String1]];
    const expectedObject = expectedArray.map((rel) => ({ rel }));

    // Act
    const arrayResult = query(all, [Relationship.type()]);
    const objectResult = query(all, { rel: Relationship.type() });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Relationship<unknown>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ rel: Relationship<unknown> }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify reference name of relationship type", () => {
    // Arrange
    const { all, entities, relationships: { Tag1, Number1, String1 } } = createEntities({ count: 3 });

    entities[0].add(Tag1.to(entities[1]));
    entities[1].add(Number1.to(entities[1]).withValue(1));
    entities[2].add(String1.to(entities[1]).withValue("hello"));

    const expectedArray = [[Tag1], [Number1], [String1]];

    // Act
    const arrayResult = query(all, [Relationship.type().as("type")]);
    const objectResult = query(all, { type: Relationship.type().as("type") });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Relationship<unknown>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ type: Relationship<unknown> }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedArray);
  });

  it("Can use relationship type reference to find relationship of type", () => {
    // Arrange
    const { all, entities, relationships: { Tag1, Number1, String1 } } = createEntities({ count: 3 });

    entities[0].add(Tag1.to(entities[1]));
    entities[1].add(Number1.to(entities[1]).withValue(1));
    entities[2].add(String1.to(entities[1]).withValue("hello"));

    const expectedArray = [[Tag1, undefined], [Number1, 1], [String1, "hello"]];

    // Act
    const arrayResult = query(
      all,
      [Relationship.type().as("type"), Relationship.as("type")],
    );
    const objectResult = query(
      all,
      { type: Relationship.type().as("type"), rel: Relationship.as("type") },
    );

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Relationship<unknown>, unknown]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ type: Relationship<unknown>, rel: unknown }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedArray);
  });

  it("Can find the same relationship type multiple times", () => {
    // Arrange
    const { all, entities, relationships: { Tag1, Number1 } } = createEntities({ count: 3 });

    entities[0].add(Tag1.to(entities[1]));
    entities[1].add(Number1.to(entities[1]).withValue(1));

    const expectedArray = [
      [Tag1, Tag1],
      [Tag1, Number1],
      [Number1, Tag1],
      [Number1, Number1],
    ];

    // Act
    const arrayResult = query(all, [Relationship.type(), Relationship.type()]);
    const objectResult = query(all, { type1: Relationship.type(), type2: Relationship.type() });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Relationship<unknown>, Relationship<unknown>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ type1: Relationship<unknown>, type2: Relationship<unknown> }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedArray);
  });

  it("Can specify that a given relationship type may only be found once", () => {
    // Arrange
    const { all, entities, relationships: { Tag1, Number1 } } = createEntities({ count: 3 });

    entities[0].add(Tag1.to(entities[1]));
    entities[1].add(Number1.to(entities[1]).withValue(1));

    const expectedArray = [
      [Tag1, Tag1],
      [Number1, Tag1],
    ];

    // Act
    const arrayResult = query(all, [Relationship.type().once(), Relationship.type()]);
    const objectResult = query(all, { type1: Relationship.type().once(), type2: Relationship.type() });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Relationship<unknown>, Relationship<unknown>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ type1: Relationship<unknown>, type2: Relationship<unknown> }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedArray);
  });

  it("Can specify source entity of relationship type", () => {
    // Arrange
    const { all, entities, relationships: { Tag1, Number1 } } = createEntities({ count: 3 });

    entities[0].add(Tag1.to(entities[1]));
    entities[0].add(Number1.to(entities[1]).withValue(1));
    entities[1].add(Number1.to(entities[1]).withValue(2));

    const expectedArray = [[Tag1], [Number1]];

    // Act
    const arrayResult = query(all, [Relationship.type().on(entities[0])]);
    const objectResult = query(all, { type: Relationship.type().on(entities[0]) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Relationship<unknown>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ type: Relationship<unknown> }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedArray);
  });

  it("Can specify source reference of relationship type", () => {
    // Arrange
    const { all, relationships: { Number1, Number2 }, entities } = createEntities({ count: 3 });

    entities[0].add(Number1.to(entities[0]).withValue(1));
    entities[1].add(Number1.to(entities[0]).withValue(2));
    entities[1].add(Number2.to(entities[0]).withValue(3));

    const expectedArray = [
      [2, Number1],
      [2, Number2],
    ];
    const expectedObject = expectedArray.map(([comp, val]) => ({ comp, val }));

    // Act
    const arrayResult = query(all, [Number2.on("ent"), Relationship.type().on("ent")]);
    const objectResult = query(all, { val: Number2.on("ent"), type: Relationship.type().on("ent") });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[number, Relationship<unknown>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ val: number, type: Relationship<unknown> }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify entity wildcard as source of relationship type", () => {
    // Arrange
    const { all, relationships: { Number1, Number2 }, entities } = createEntities({ count: 3 });

    entities[0].add(Number1.to(entities[0]).withValue(1));
    entities[1].add(Number1.to(entities[0]).withValue(2));
    entities[1].add(Number2.to(entities[0]).withValue(3));

    const expectedArray = [
      [Number1],
      [Number1],
      [Number2],
    ];
    const expectedObject = expectedArray.map(([comp, val]) => ({ comp, val }));

    // Act
    const arrayResult = query(all, [Relationship.type().on(Entity)]);
    const objectResult = query(all, { type: Relationship.type().on(Entity) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Relationship<unknown>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ type: Relationship<unknown> }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify component wildcard as source of relationship type", () => {
    // Arrange
    const { all, relationships: { Number1, Number2 }, entities } = createEntities({ count: 3 });

    entities[0].add(Number1.to(entities[0]).withValue(1));
    Number1.add(Number1.to(entities[0]).withValue(2));
    Number2.add(Number1.to(entities[0]).withValue(3));

    const expectedArray = [
      [Number1],
      [Number1],
    ];
    const expectedObject = expectedArray.map(([comp, val]) => ({ comp, val }));

    // Act
    const arrayResult = query(all, [Relationship.type().on(Component)]);
    const objectResult = query(all, { type: Relationship.type().on(Component) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Relationship<unknown>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ type: Relationship<unknown> }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify relationship wildcard as source of relationship type", () => {
    // Arrange
    const { all, relationships: { Tag1, Number1, Number2 } } = createEntities({ count: 3 });

    Tag1.add(Number1.to(all[0]).withValue(1));
    Number1.add(Number1.to(all[0]).withValue(2));
    Number2.add(Number1.to(all[0]).withValue(3));

    const expectedArray = [
      [Number1],
    ];
    const expectedObject = expectedArray.map(([comp, val]) => ({ comp, val }));

    // Act
    const arrayResult = query(all, [Relationship.type().on(Relationship)]);
    const objectResult = query(all, { type: Relationship.type().on(Relationship) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Relationship<unknown>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ type: Relationship<unknown> }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify target entity of relationship type", () => {
    // Arrange
    const { all, entities, relationships: { Number1, Number2 } } = createEntities({ count: 3 });

    entities[0].add(Number1.to(entities[1]).withValue(1));
    entities[1].add(Number1.to(entities[2]).withValue(2));
    entities[1].add(Number2.to(entities[1]).withValue(3));

    const expectedArray = [[Number1], [Number2]];

    // Act
    const arrayResult = query(all, [Relationship.type().to(entities[1])]);
    const objectResult = query(all, { type: Relationship.type().to(entities[1]) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Relationship<unknown>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ type: Relationship<unknown> }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedArray);
  });

  it("Can specify target reference of relationship type", () => {
    // Arrange
    const { all, relationships: { Number1, Number2 }, entities } = createEntities({ count: 3 });

    entities[0].add(Number1.to(entities[0]).withValue(1));
    entities[1].add(Number1.to(entities[0]).withValue(2));
    entities[1].add(Number2.to(entities[0]).withValue(3));

    const expectedArray = [
      [Number1],
      [Number1],
      [Number2],
    ];
    const expectedObject = expectedArray.map(([comp, val]) => ({ comp, val }));

    // Act
    const arrayResult = query(all, [Relationship.type().to("ent")]);
    const objectResult = query(all, { type: Relationship.type().to("ent") });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Relationship<unknown>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ type: Relationship<unknown> }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify entity wildcard as target of relationship type", () => {
    // Arrange
    const { all, relationships: { Number1, Number2 }, entities } = createEntities({ count: 3 });

    entities[0].add(Number1.to(entities[0]).withValue(1));
    entities[1].add(Number1.to(entities[1]).withValue(2));
    entities[1].add(Number2.to(entities[0]).withValue(3));

    const expectedArray = [
      [Number1],
      [Number1],
      [Number2],
    ];
    const expectedObject = expectedArray.map(([comp, val]) => ({ comp, val }));

    // Act
    const arrayResult = query(all, [Relationship.type().to(Entity)]);
    const objectResult = query(all, { type: Relationship.type().to(Entity) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Relationship<unknown>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ type: Relationship<unknown> }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify component wildcard as target of relationship type", () => {
    // Arrange
    const {
      all,
      relationships: { Number1, Number2 },
      components: { String1, String2 },
      entities,
    } = createEntities({ count: 3 });

    entities[0].add(Number1.to(entities[0]).withValue(1));
    entities[0].add(Number1.to(String1).withValue(2));
    entities[0].add(Number2.to(String2).withValue(3));

    const expectedArray = [
      [Number1],
      [Number2],
    ];
    const expectedObject = expectedArray.map(([comp, val]) => ({ comp, val }));

    // Act
    const arrayResult = query(all, [Relationship.type().to(Component)]);
    const objectResult = query(all, { type: Relationship.type().to(Component) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Relationship<unknown>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ type: Relationship<unknown> }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify relationship wildcard as target of relationship type", () => {
    // Arrange
    const { all, relationships: { Number1, Number2 }, entities } = createEntities({ count: 3 });

    entities[0].add(Number1.to(entities[0]).withValue(1));
    entities[0].add(Number1.to(Number1).withValue(2));
    entities[0].add(Number1.to(Number2).withValue(3));

    const expectedArray = [
      [Number1],
      [Number2],
    ];
    const expectedObject = expectedArray.map(([comp, val]) => ({ comp, val }));

    // Act
    const arrayResult = query(all, [Relationship.type().to(Relationship)]);
    const objectResult = query(all, { type: Relationship.type().to(Relationship) });

    // Assert
    assertTypesEqual<typeof arrayResult, Array<[Relationship<unknown>]>>(true);
    assertTypesEqual<typeof objectResult, Array<{ type: Relationship<unknown> }>>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });
});

describe("Ordering of query parts", () => {
  it("Ordering of query parts does not matter", () => {
    // Arrange
    const {
      all,
      entities,
      relationships: { Number1, Number2 },
    } = createEntities({ count: 3 });

    entities[0].add(Number1.to(entities[1]).withValue(1));
    entities[0].add(Number2.to(entities[0]).withValue(2));
    entities[1].add(Number1.to(entities[2]).withValue(3));

    // Act
    const result1 = query(all, [
      Entity.as("source"),
      Relationship.type().as("type"),
      Relationship.as("type").to("target"),
      Entity.as("target"),
    ]);
    const result2 = query(all, [
      Entity.as("source"),
      Entity.as("target"),
      Relationship.as("type").to("target"),
      Relationship.type().as("type"),
    ]);
    const result3 = query(all, [
      Entity.as("target"),
      Relationship.as("type").to("target"),
      Relationship.type().as("type"),
      Entity.as("source"),
    ]);

    // Assert
    assert.deepStrictEqual(result1, [
      [entities[0], Number1, 1, entities[1]],
      [entities[0], Number2, 2, entities[0]],
      [entities[1], Number1, 3, entities[2]],
    ]);
    assert.deepStrictEqual(result2, [
      [entities[0], entities[1], 1, Number1],
      [entities[0], entities[0], 2, Number2],
      [entities[1], entities[2], 3, Number1],
    ]);
    assert.deepStrictEqual(result3, [
      [entities[1], 1, Number1, entities[0]],
      [entities[0], 2, Number2, entities[0]],
      [entities[2], 3, Number1, entities[1]],
    ]);
  });
});

describe("Dynamic queries", () => {
  it("", () => {
    // Arrange
    const {
      all,
      entities,
      components,
      relationships,
    } = createEntities({ count: 3 });

    const randomComponent: Component<unknown> = Math.random() > 0.5
      ? components.Number1
      : components.String1;
    const randomRelationship: Relationship<unknown> = Math.random() > 0.5
      ? relationships.Number1
      : relationships.String1;

    entities[0].add(randomComponent.withValue(1));
    entities[0].add(randomRelationship.to(entities[1]).withValue("hello"));

    // Act
    const result = query(all, [randomComponent, randomRelationship]);

    // Assert
    assertTypesEqual<typeof result, Array<[unknown, unknown]>>(true);

    assert.deepStrictEqual(result, [[1, 2]]);
  });
});

describe("Negative tests", () => {
  it("Can't pass wrong types to query", () => {
    // @ts-expect-error
    query([], [1]);
    // @ts-expect-error
    query([], { x: 1 });
    // @ts-expect-error
    query([], [""]);
    // @ts-expect-error
    query([], { x: "" });
    // @ts-expect-error
    query([], [{}]);
    // @ts-expect-error
    query([], { x: {} });
    // @ts-expect-error
    query([], [[]]);
    // @ts-expect-error
    query([], { x: [] });
    // @ts-expect-error
    query([], [null]);
    // @ts-expect-error
    query([], { x: null });
    // @ts-expect-error
    query([], [undefined]);
    // @ts-expect-error
    query([], { x: undefined });
    // @ts-expect-error
    query([], [{} as unknown]);
    // @ts-expect-error
    query([], { x: {} as unknown });
  });
});

describe("Crazy queries", () => {
  it("Spaceship factions", () => {
    // Arrange
    const { entities } = createEntities({ count: 10 });

    const Spaceship = new Component<{ licensePlate: string }>("Spaceship");
    const Planet = new Component<{ biome: "desert" | "forest" | "normal" }>("Planet");
    const Faction = new Relationship<{ rep: number }>("Faction");
    const DockedTo = new Relationship("DockedTo");
    const RuledBy = new Relationship("RuledBy");
    const AlliedWith = new Relationship<{ rep: number }>("AlliedWith");

    const empire = new Entity("Empire");
    const rebellion = new Entity("Rebellion");
    const bountyHunters = new Entity("Bounty Hunters");

    const deathStar = new Entity("Death Star");
    const millenniumFalcon = new Entity("Millennium Falcon");
    const tieFighter = new Entity("Tie Fighter");
    const bountyShip = new Entity("Bounty Ship");

    const alderaan = new Entity("Alderaan");
    const tatooine = new Entity("Tatooine");
    const endor = new Entity("Endor");

    // I never watched Star Wars, don't @ me

    deathStar.add(Spaceship.withValue({ licensePlate: "DS-1" }));
    millenniumFalcon.add(Spaceship.withValue({ licensePlate: "MF-1" }));
    tieFighter.add(Spaceship.withValue({ licensePlate: "TF-1" }));
    bountyShip.add(Spaceship.withValue({ licensePlate: "BS-1" }));

    deathStar.add(Faction.to(empire).withValue({ rep: 200 }));
    tieFighter.add(Faction.to(empire).withValue({ rep: 100 }));
    millenniumFalcon.add(Faction.to(rebellion).withValue({ rep: 50 }));
    bountyShip.add(Faction.to(bountyHunters).withValue({ rep: 2 }));

    alderaan.add(Planet.withValue({ biome: "normal" }));
    tatooine.add(Planet.withValue({ biome: "desert" }));
    endor.add(Planet.withValue({ biome: "forest" }));

    alderaan.add(RuledBy.to(empire));
    tatooine.add(RuledBy.to(empire));
    endor.add(RuledBy.to(rebellion));

    deathStar.add(DockedTo.to(alderaan));
    millenniumFalcon.add(DockedTo.to(tatooine));
    tieFighter.add(DockedTo.to(endor));
    bountyShip.add(DockedTo.to(tatooine));

    empire.add(AlliedWith.to(bountyHunters).withValue({ rep: 40 }));

    // Act
    const result = query(entities, [
      Spaceship.on("spaceship"),
      Faction.on("spaceship").to("spaceship_faction"),
      DockedTo.on("spaceship").to("planet"),
      Planet.on("planet"),
      RuledBy.on("planet").to("planet_faction"),
      or(
        equals("spaceship_faction", "planet_faction"),
        AlliedWith.on("spaceship_faction").to("planet_faction"),
        AlliedWith.on("planet_faction").to("spaceship_faction"),
      ),
    ]);

    // Assert
    assertTypesEqual<typeof result, Array<[
      { licensePlate: string },
      { rep: number },
      undefined,
      { biome: "desert" | "forest" | "normal" },
      undefined,
      ({ rep: number } | undefined)
    ]>>(true);

    assert.deepStrictEqual(result, [
      ["DS-1", 200, undefined, "normal", undefined, undefined],
      ["BS-1", 2, undefined, "desert", undefined, 40],
    ]);
  });
});

// TODO: Boolean queries
// TODO: What happens if a relation points to an entity not in the list? Is such a thing even possible?
//  Maybe rather, it's what happens if a relation points to an entity that has been destroyed?

function createEntities(options: {
  count: number
}): {
  all: Entity[],
  entities: Entity[],
  components: {
    Tag1: Component,
    Tag2: Component,
    Number1: Component<number>,
    Number2: Component<number>,
    String1: Component<string>,
    String2: Component<string>,
  },
  relationships: {
    Tag1: Relationship,
    Tag2: Relationship,
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

  const all: Entity[] = [
    ...entities,
    ...Object.values(components),
    ...Object.values(relationships),
  ];

  return {
    all,
    entities,
    components,
    relationships,
  };
}

function permutations<T>(array: T[]): T[][] {
  return array.flatMap((item1) => array.map((item2) => [item1, item2]));
}
