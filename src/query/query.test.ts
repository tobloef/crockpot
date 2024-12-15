import {
  describe,
  it,
} from "node:test";
import * as assert from "node:assert";
import { query } from "./query.ts";
import { Entity } from "../entity/index.ts";
import { Component } from "../component/index.ts";
import { Relationship } from "../relationship/index.ts";
import { assertTypesEqual } from "../utils/type-assertions.ts";
import type { Class } from "../utils/class.js";

describe("Empty query", () => {
  it("Finds nothing when input is empty tuple", () => {
    // Arrange
    const { all } = createEntities({ count: 3 });

    // Act
    const arrayResult = query(all, []);
    const objectResult = query(all, {});

    // Assert
    assertTypesEqual<typeof arrayResult, []>(true);
    assertTypesEqual<typeof objectResult, {}>(true);

    assert.deepStrictEqual(arrayResult, []);
    assert.deepStrictEqual(objectResult, {});
  });
});

describe("Entity instance query", () => {
  it("Finds specific entity instance", () => {
    // Arrange
    const { all, entities } = createEntities({ count: 3 });

    // Act
    const arrayResult = query(all, [ entities[1] ]);
    const objectResult = query(all, { ent: entities[1] });

    // Assert
    assertTypesEqual<typeof arrayResult, [ Entity ]>(true);
    assertTypesEqual<typeof objectResult, { ent: Entity }>(true);

    assert.deepStrictEqual(arrayResult, [ entities[1] ]);
    assert.deepStrictEqual(objectResult, { ent: entities[1] });
  });

  it("Can find multiple different entities in single query", () => {
    // Arrange
    const { all, entities } = createEntities({ count: 3 });

    // Act
    const arrayResult = query(all, [ entities[1], entities[2] ]);
    const objectResult = query(all, { ent1: entities[1], ent2: entities[2] });

    // Assert
    assertTypesEqual<typeof arrayResult, [ Entity, Entity ]>(true);
    assertTypesEqual<typeof objectResult, { ent1: Entity, ent2: Entity }>(true);

    assert.deepStrictEqual(arrayResult, [ entities[1], entities[2] ]);
    assert.deepStrictEqual(objectResult, { ent1: entities[1], ent2: entities[2] });
  });

  it("Can find same entity multiple times in single query", () => {
    // Arrange
    const { all, entities } = createEntities({ count: 3 });

    // Act
    const arrayResult = query(all, [ entities[1], entities[1] ]);
    const objectResult = query(all, { ent1: entities[1], ent2: entities[1] });

    // Assert
    assertTypesEqual<typeof arrayResult, [ Entity, Entity ]>(true);
    assertTypesEqual<typeof objectResult, { ent1: Entity, ent2: Entity }>(true);

    assert.deepStrictEqual(arrayResult, [ entities[1], entities[1] ]);
    assert.deepStrictEqual(objectResult, { ent1: entities[1], ent2: entities[1] });
  });

  it("Does not find entity if not on the list", () => {
    // Arrange
    const { all } = createEntities({ count: 3 });
    const otherEntity = new Entity();

    // Act
    const arrayResult = query(all, [ otherEntity ]);
    const objectResult = query(all, { ent: otherEntity });

    // Assert
    assertTypesEqual<typeof arrayResult, [ Entity ]>(true);
    assertTypesEqual<typeof objectResult, { ent: Entity }>(true);

    assert.deepStrictEqual(arrayResult, []);
    assert.deepStrictEqual(objectResult, {});
  });
});

describe("Entity wildcard query", () => {
  it("Finds all entities", () => {
    // Arrange
    const { entities } = createEntities({ count: 3 });

    // Act
    const arrayResult = query(entities, [ Entity ]);
    const objectResult = query(entities, { ent: Entity });

    // Assert
    assertTypesEqual<typeof arrayResult, [ Entity ]>(true);
    assertTypesEqual<typeof objectResult, { ent: Entity }>(true);

    assert.deepStrictEqual(arrayResult, entities.map((entity) => [ entity ]));
    assert.deepStrictEqual(objectResult, entities.map((entity) => ({ ent: entity })));
  });

  it("Finds all component types", () => {
    // Arrange
    const { components } = createEntities({ count: 3 });

    const expectedArray = Object.values(components).map((component) => [ component ]);
    const expectedObject = Object.values(components).map((component) => ({ ent: component }));

    // Act
    const arrayResult = query(Object.values(components), [ Entity ]);
    const objectResult = query(Object.values(components), { ent: Entity });

    // Assert
    assertTypesEqual<typeof arrayResult, [ Entity ]>(true);
    assertTypesEqual<typeof objectResult, { ent: Entity }>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds all relationship types", () => {
    // Arrange
    const { relationships } = createEntities({ count: 3 });

    const expectedArray = Object.values(relationships).map((relationship) => [ relationship ]);
    const expectedObject = Object.values(relationships).map((relationship) => ({ ent: relationship }));

    // Act
    const arrayResult = query(Object.values(relationships), [ Entity ]);
    const objectResult = query(Object.values(relationships), { ent: Entity });

    // Assert
    assertTypesEqual<typeof arrayResult, [ Entity ]>(true);
    assertTypesEqual<typeof objectResult, { ent: Entity }>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Finds nothing when entity list is empty", () => {
    // Arrange
    createEntities({ count: 3 });

    // Act
    const arrayResult = query([], [ Entity ]);
    const objectResult = query([], { ent: Entity });

    // Assert
    assertTypesEqual<typeof arrayResult, [ Entity ]>(true);
    assertTypesEqual<typeof objectResult, { ent: Entity }>(true);

    assert.deepStrictEqual(arrayResult, []);
    assert.deepStrictEqual(objectResult, {});
  });

  it("Can give entity wildcard reference name", () => {
    // Arrange
    const { all } = createEntities({ count: 3 });

    // Act
    const arrayResult = query(all, [ Entity.as("ent") ]);
    const objectResult = query(all, { ent: Entity.as("ent") });

    // Assert
    assertTypesEqual<typeof arrayResult, [ Entity ]>(true);
    assertTypesEqual<typeof objectResult, { ent: Entity }>(true);

    assert.deepStrictEqual(arrayResult, all.map((entity) => [ entity ]));
    assert.deepStrictEqual(objectResult, all.map((entity) => ({ ent: entity })));
  });

  it("Find the same entity multiple times", () => {
    // Arrange
    const { entities } = createEntities({ count: 3 });

    const expectedArray = permutations(entities);
    const expectedObject = expectedArray.map(([ ent1, ent2 ]) => ({ ent1, ent2 }));

    // Act
    const arrayResult = query(entities, [ Entity, Entity ]);
    const objectResult = query(entities, { ent1: Entity, ent2: Entity });

    // Assert
    assertTypesEqual<typeof arrayResult, [ Entity, Entity ]>(true);
    assertTypesEqual<typeof objectResult, { ent1: Entity, ent2: Entity }>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify that an entity may only be found once for a wildcard", () => {
    // Arrange
    const { entities } = createEntities({ count: 3 });
    const expectedArray = [
      [ entities[0], entities[0], entities[0] ],
      [ entities[1], entities[0], entities[0] ],
      [ entities[2], entities[0], entities[0] ],
    ]
    const expectedObject = expectedArray.map(([ ent1, ent2, ent3 ]) => ({ ent1, ent2, ent3 }));

    // Act
    const arrayResult = query(entities, [ Entity.once(), Entity, Entity ]);
    const objectResult = query(entities, { ent1: Entity.once(), ent2: Entity, ent3: Entity });

    // Assert
    assertTypesEqual<typeof arrayResult, [ Entity, Entity, Entity ]>(true);
    assertTypesEqual<typeof objectResult, { ent1: Entity, ent2: Entity, ent3: Entity }>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify that multiple entities may only be found once for their wildcards", () => {
    // Arrange
    const { entities } = createEntities({ count: 3 });
    const expectedArray = [
      [ entities[0], entities[0], entities[0] ],
      [ entities[1], entities[1], entities[0] ],
      [ entities[2], entities[2], entities[0] ],
    ]
    const expectedObject = expectedArray.map(([ ent1, ent2, ent3 ]) => ({ ent1, ent2, ent3 }));

    // Act
    const arrayResult = query(entities, [ Entity.once(), Entity.once(), Entity ]);
    const objectResult = query(entities, { ent1: Entity.once(), ent2: Entity.once(), ent3: Entity });

    // Assert
    assertTypesEqual<typeof arrayResult, [ Entity, Entity, Entity ]>(true);
    assertTypesEqual<typeof objectResult, { ent1: Entity, ent2: Entity, ent3: Entity }>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify multiple wildcards with different reference names", () => {
    // Arrange
    const { entities } = createEntities({ count: 3 });
    const expectedArray = permutations(entities);
    const expectedObject = expectedArray.map(([ ent1, ent2 ]) => ({ ent1, ent2 }));

    // Act
    const arrayResult = query(entities, [ Entity.as("one"), Entity.as("two") ]);
    const objectResult = query(entities, { ent1: Entity.as("one"), ent2: Entity.as("two") });

    // Assert
    assertTypesEqual<typeof arrayResult, [ Entity, Entity ]>(true);
    assertTypesEqual<typeof objectResult, { ent1: Entity, ent2: Entity }>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify multiple wildcards with same reference name", () => {
    // Arrange
    const { entities } = createEntities({ count: 3 });
    const expectedArray = entities.map((ent) => [ ent, ent ]);
    const expectedObject = entities.map((ent) => ({ ent1: ent, ent2: ent }));

    // Act
    const arrayResult = query(entities, [ Entity.as("ref"), Entity.as("ref") ]);
    const objectResult = query(entities, { ent1: Entity.as("ref"), ent2: Entity.as("ref") });

    // Assert
    assertTypesEqual<typeof arrayResult, [ Entity, Entity ]>(true);
    assertTypesEqual<typeof objectResult, { ent1: Entity, ent2: Entity }>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify same reference name on a wildcard as another wildcard that may only be found once", () => {
    // Arrange
    const { entities } = createEntities({ count: 3 });
    const expectedArray = [
      [ entities[0], entities[0], entities[0] ],
      [ entities[1], entities[1], entities[0] ],
      [ entities[2], entities[2], entities[0] ],
    ];
    const expectedObject = expectedArray.map(([ ent1, ent2, ent3 ]) => ({ ent1, ent2, ent3 }));

    // Act
    const arrayResult = query(entities, [ Entity.as("a").once(), Entity.as("a"), Entity.as("c") ]);
    const objectResult = query(entities, { ent1: Entity.as("a").once(), ent2: Entity.as("a"), ent3: Entity.as("c") });

    // Assert
    assertTypesEqual<typeof arrayResult, [ Entity, Entity, Entity ]>(true);
    assertTypesEqual<typeof objectResult, { ent1: Entity, ent2: Entity, ent3: Entity }>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });
});

describe("Entity type query", () => {
  it("Finds that type of base entities are Entity", () => {
    // Arrange
    const { entities } = createEntities({ count: 3 });

    // Act
    const arrayResult = query(entities, [ Entity.type() ]);
    const objectResult = query(entities, { typ: Entity.type() });

    // Assert
    assertTypesEqual<typeof arrayResult, [ Class<Entity> ]>(true);
    assertTypesEqual<typeof objectResult, { typ: Class<Entity> }>(true);

    assert.deepStrictEqual(arrayResult, entities.map(() => [ Entity ]));
    assert.deepStrictEqual(objectResult, entities.map(() => ({ typ: Entity })));
  });

  it("Finds that type of component types are the component types", () => {
    // Arrange
    const { components } = createEntities({ count: 3 });

    // Act
    const arrayResult = query(Object.values(components), [ Entity.type() ]);
    const objectResult = query(Object.values(components), { typ: Entity.type() });

    // Assert
    assertTypesEqual<typeof arrayResult, [ Class<Entity> ]>(true);
    assertTypesEqual<typeof objectResult, { typ: Class<Entity> }>(true);

    assert.deepStrictEqual(arrayResult, Object.values(components).map(() => [ Component ]));
    assert.deepStrictEqual(objectResult, Object.values(components).map(() => ({ typ: Component })));
  });

  it("Finds that type of relationship types are the relationship types", () => {
    // Arrange
    const { relationships } = createEntities({ count: 3 });

    // Act
    const arrayResult = query(Object.values(relationships), [ Entity.type() ]);
    const objectResult = query(Object.values(relationships), { typ: Entity.type() });

    // Assert
    assertTypesEqual<typeof arrayResult, [ Class<Entity> ]>(true);
    assertTypesEqual<typeof objectResult, { typ: Class<Entity> }>(true);

    assert.deepStrictEqual(arrayResult, Object.values(relationships).map(() => [ Relationship ]));
    assert.deepStrictEqual(objectResult, Object.values(relationships).map(() => ({ typ: Relationship })));
  });

  it("Can specify reference name for entity type", () => {
    // Arrange
    const { entities } = createEntities({ count: 3 });

    // Act
    const arrayResult = query(entities, [ Entity.type().as("typ") ]);
    const objectResult = query(entities, { typ: Entity.type().as("typ") });

    // Assert
    assertTypesEqual<typeof arrayResult, [ Class<Entity> ]>(true);
    assertTypesEqual<typeof objectResult, { typ: Class<Entity> }>(true);

    assert.deepStrictEqual(arrayResult, entities.map(() => [ Entity ]));
    assert.deepStrictEqual(objectResult, entities.map(() => ({ typ: Entity })));
  });

  it("Can find the same entity type multiple times", () => {
    // Arrange
    const { entities: [ entity ], components: { Tag1 } } = createEntities({ count: 1 });
    const entityList = [ entity, Tag1 ];

    const expectedArray = [
      [ Entity, Entity ],
      [ Entity, Tag1 ],
      [ Tag1, Entity ],
      [ Tag1, Tag1 ],
    ];
    const expectedObject = expectedArray.map(([ typ1, typ2 ]) => ({ typ1, typ2 }));

    // Act
    const arrayResult = query(entityList, [ Entity.type(), Entity.type() ]);
    const objectResult = query(entityList, { typ1: Entity.type(), typ2: Entity.type() });

    // Assert
    assertTypesEqual<typeof arrayResult, [ Class<Entity>, Class<Entity> ]>(true);
    assertTypesEqual<typeof objectResult, { typ1: Class<Entity>, typ2: Class<Entity> }>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify that an entity type may only be found once for a wildcard", () => {
    // Arrange
    const {
      entities: [ entity ],
      components: { Tag1 },
      relationships: { Number1 },
    } = createEntities({ count: 1 });
    const entityList = [ entity, Tag1, Number1 ];

    const expectedArray = [
      [ Entity, Entity, Entity ],
      [ Tag1, Entity, Entity ],
      [ Number1, Entity, Entity ],
    ];
    const expectedObject = expectedArray.map(([ typ1, typ2, typ3 ]) => ({ typ1, typ2, typ3 }));

    // Act
    const arrayResult = query(entityList, [ Entity.type().once(), Entity.type(), Entity.type() ]);
    const objectResult = query(entityList, { typ1: Entity.type().once(), typ2: Entity.type(), typ3: Entity.type() });

    // Assert
    assertTypesEqual<typeof arrayResult, [ Class<Entity>, Class<Entity>, Class<Entity> ]>(true);
    assertTypesEqual<typeof objectResult, { typ1: Class<Entity>, typ2: Class<Entity>, typ3: Class<Entity> }>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify that multiple entities types may only be found once for their wildcards", () => {
    // Arrange
    const {
      entities: [ entity ],
      components: { Tag1 },
      relationships: { Number1 },
    } = createEntities({ count: 1 });
    const entityList = [ entity, Tag1, Number1 ];

    const expectedArray = [
      [ Entity, Entity, Entity ],
      [ Tag1, Tag1, Entity ],
      [ Number1, Number1, Entity ],
    ];
    const expectedObject = expectedArray.map(([ typ1, typ2, typ3 ]) => ({ typ1, typ2, typ3 }));

    // Act
    const arrayResult = query(
      entityList,
      [ Entity.type().once(), Entity.type().once(), Entity.type() ],
    );
    const objectResult = query(
      entityList,
      { typ1: Entity.type().once(), typ2: Entity.type().once(), typ3: Entity.type() },
    );

    // Assert
    assertTypesEqual<typeof arrayResult, [ Class<Entity>, Class<Entity>, Class<Entity> ]>(true);
    assertTypesEqual<typeof objectResult, { typ1: Class<Entity>, typ2: Class<Entity>, typ3: Class<Entity> }>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify multiple types with different reference names", () => {
    // Arrange
    const {
      entities: [ entity ],
      components: { Tag1 },
      relationships: { Number1 },
    } = createEntities({ count: 1 });
    const entityList = [ entity, Tag1, Number1 ];

    const expectedArray = [
      [ Entity, Entity ],
      [ Entity, Tag1 ],
      [ Entity, Number1 ],
      [ Tag1, Entity ],
      [ Tag1, Tag1 ],
      [ Tag1, Number1 ],
      [ Number1, Entity ],
      [ Number1, Tag1 ],
      [ Number1, Number1 ],
    ];
    const expectedObject = expectedArray.map(([ typ1, typ2 ]) => ({ typ1, typ2 }));

    // Act
    const arrayResult = query(entityList, [ Entity.type().as("one"), Entity.type().as("two") ]);
    const objectResult = query(entityList, { typ1: Entity.type().as("one"), typ2: Entity.type().as("two") });

    // Assert
    assertTypesEqual<typeof arrayResult, [ Class<Entity>, Class<Entity> ]>(true);
    assertTypesEqual<typeof objectResult, { typ1: Class<Entity>, typ2: Class<Entity> }>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify multiple types with same reference name", () => {
    // Arrange
    const {
      entities: [ entity ],
      components: { Tag1 },
      relationships: { Number1 },
    } = createEntities({ count: 1 });
    const entityList = [ entity, Tag1, Number1 ];

    const expectedArray = [
      [ Entity, Entity ],
      [ Tag1, Tag1 ],
      [ Number1, Number1 ],
    ];
    const expectedObject = expectedArray.map(([ typ1, typ2 ]) => ({ typ1, typ2 }));

    // Act
    const arrayResult = query(entityList, [ Entity.type().as("ref"), Entity.type().as("ref") ]);
    const objectResult = query(entityList, { typ1: Entity.type().as("ref"), typ2: Entity.type().as("ref") });

    // Assert
    assertTypesEqual<typeof arrayResult, [ Class<Entity>, Class<Entity> ]>(true);
    assertTypesEqual<typeof objectResult, { typ1: Class<Entity>, typ2: Class<Entity> }>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });

  it("Can specify same reference name on a type as another type that may only be found once", () => {
    // Arrange
    const {
      entities: [ entity ],
      components: { Tag1 },
      relationships: { Number1 },
    } = createEntities({ count: 1 });
    const entityList = [ entity, Tag1, Number1 ];

    const expectedArray = [
      [ Entity, Entity, Entity ],
      [ Tag1, Tag1, Entity ],
      [ Number1, Number1, Entity ],
    ];
    const expectedObject = expectedArray.map(([ typ1, typ2, typ3 ]) => ({ typ1, typ2, typ3 }));

    // Act
    const arrayResult = query(
      entityList,
      [ Entity.type().as("a").once(), Entity.type().as("a"), Entity.type().as("c") ],
    );
    const objectResult = query(
      entityList,
      { typ1: Entity.type().as("a").once(), typ2: Entity.type().as("a"), ent3: Entity.type().as("c") },
    );

    // Assert
    assertTypesEqual<typeof arrayResult, [ Class<Entity>, Class<Entity>, Class<Entity> ]>(true);
    assertTypesEqual<typeof objectResult, { typ1: Class<Entity>, typ2: Class<Entity>, ent3: Class<Entity> }>(true);

    assert.deepStrictEqual(arrayResult, expectedArray);
    assert.deepStrictEqual(objectResult, expectedObject);
  });
});

describe("Component instance query", () => {
  it("Finds tag components on entities", () => {
  });

  it("Finds value component on entities", () => {
  });

  it("Can find multiple different component values in single query", () => {
  });

  it("Can find same component value multiple times in single query", () => {
  });

  it("Does not find component value if not on an entity", () => {
  });

  it("Finds component value on specific entity", () => {
  });

  it("Finds component value on entity reference", () => {
  });

  it("Finds component value on any entity using wildcard", () => {
  });

  it("Finds component value on any component type using wildcard", () => {
  });

  it("Finds component value on any relationship type using wildcard", () => {
  });

  it("Does not find component value on specific entity if it does not have it", () => {
  });

  it("Does not find component value on specific entity if entity not in list", () => {
  });

  it("Finds entity with the specific component", () => {
  });

  it("Does not find anything if query only has partial match", () => {
  });
});

describe("Component wildcard query", () => {
  it("Finds all components", () => {
  });

  it("Finds all components on specific entity", () => {
  });

  it("Finds all components on references entity", () => {
  });

  it("Finds all components on any entity", () => {
  });

  it("Finds all components on any component", () => {
  });

  it("Finds all components on any relationship", () => {
  });

  it("Finds all components and their attached entity by reference", () => {
  });

  it("Can specify reference name for found component (not for found values)", () => {
  });

  it("Can find the same component multiple times", () => {
  });

  it("Can specify that a given component type may only be found once", () => {
  });

  it("Can find the same component value with two different wildcards", () => {
  });

  it(
    "Can specify that a given component type may only be found once, while another may be found multiple times",
    () => {
    },
  );
});

describe("Component type query", () => {
  it("Find all component types", () => {
  });

  it("Can specify reference name of component type", () => {
  });

  it("Can use component type reference to find components of type", () => {
    // Component.type().as("type"), Component.as("type")
  });

  it("Can find the same component type multiple times", () => {
  });

  it("Can specify that a given component type may only be found once", () => {
  });

  it(
    "Can specify that a given component type may only be found once, while another may be found multiple times",
    () => {
    },
  );

  it("Can specify source entity of component type", () => {
  });

  it("Can specify source reference of component type", () => {
  });

  it("Can specify entity wildcard as source of component type", () => {
  });

  it("Can specify component wildcard as source of component type", () => {
  });

  it("Can specify relationship wildcard as source of component type", () => {
  });
});

describe("Relationship instance query", () => {
  it("Finds tag relationship on entities", () => {
  });

  it("Finds value relationship on entities", () => {
  });

  it("Can find multiple different relationship values in single query", () => {
  });

  it("Can find same relationship value multiple times in single query", () => {
  });

  it("Does not find relationship value if not on an entity", () => {
  });

  it("Finds relationship value on specific entity", () => {
  });

  it("Finds relationship value on entity reference", () => {
  });

  it("Finds relationship value on any entity using wildcard", () => {
  });

  it("Finds relationship value on any component type using wildcard", () => {
  });

  it("Finds relationship value on any relationship type using wildcard", () => {
  });

  it("Finds relationship value to specific entity", () => {
  });

  it("Finds relationship value to entity reference", () => {
  });

  it("Finds relationship value to any entity using wildcard", () => {
  });

  it("Finds relationship value to any component type using wildcard", () => {
  });

  it("Finds relationship value to any relationship type using wildcard", () => {
  });

  it("Does not find relationship value on specific entity if it does not have it", () => {
  });

  it("Does not find relationship value on specific entity if entity not in list", () => {
  });

  it("Finds entity with the specific relationship", () => {
  });

  it("Finds explicit relationship to self", () => {
  });

  it("Finds transitive relationship to self by reference", () => {
  });
});

describe("Relationship wildcard query", () => {
  it("Finds all relationships", () => {
  });

  it("Finds all relationships on specific entity", () => {
  });

  it("Finds all relationships on references entity", () => {
  });

  it("Finds all relationships on any entity", () => {
  });

  it("Finds all relationships on any component", () => {
  });

  it("Finds all relationships on any relationship", () => {
  });

  it("Finds all relationships and their source entity by reference", () => {
  });

  it("Finds all relationships to specific entity", () => {
  });

  it("Finds all relationships to references entity", () => {
  });

  it("Finds all relationships to any entity", () => {
  });

  it("Finds all relationships to any component", () => {
  });

  it("Finds all relationships to any relationship", () => {
  });

  it("Finds all relationships and their target entity by reference", () => {
  });

  it("Can specify reference name for found relationship (not for found values)", () => {
  });

  it("Can find the same relationship multiple times", () => {
  });

  it("Can specify that a given relationship type may only be found once", () => {
  });

  it("Can find the same relationship value with two different wildcards", () => {
  });

  it(
    "Can specify that a given relationship type may only be found once, while another may be found multiple times",
    () => {
    },
  );

  it("Finds direct circular relationship", () => {
  });

  it("Finds transitive circular relationship", () => {
  });
});

describe("Relationship type query", () => {
  it("Find all relationship types", () => {
  });

  it("Can specify reference name of relationship type", () => {
  });

  it("Can use relationship type reference to find relationship of type", () => {
    // Relationship.type().as("type"), Relationship.as("type")
  });

  it("Can find the same relationship type multiple times", () => {
  });

  it("Can specify that a given relationship type may only be found once", () => {
  });

  it(
    "Can specify that a given relationship type may only be found once, while another may be found multiple times",
    () => {
    },
  );

  it("Can specify source entity of relationship type", () => {
  });

  it("Can specify source reference of relationship type", () => {
  });

  it("Can specify entity wildcard as source of relationship type", () => {
  });

  it("Can specify component wildcard as source of relationship type", () => {
  });

  it("Can specify relationship wildcard as source of relationship type", () => {
  });

  it("Can specify target entity of relationship type", () => {
  });

  it("Can specify target reference of relationship type", () => {
  });

  it("Can specify entity wildcard as target of relationship type", () => {
  });

  it("Can specify component wildcard as target of relationship type", () => {
  });

  it("Can specify relationship wildcard as target of relationship type", () => {
  });
});

describe("Ordering of query parts", () => {
  it("Ordering of query parts does not matter", () => {
  });
});

// TODO: Boolean queries
// TODO: Dynamic queries (e.g. from user input)
// TODO: Some negative tests, stuff you can't pass in, etc.

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

function permutations<T>(array: T[]): T[][] {
  return array.flatMap((item1) => array.map((item2) => [ item1, item2 ]));
}
