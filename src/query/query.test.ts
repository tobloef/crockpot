import { describe, it, } from "node:test";
import * as assert from "node:assert";
import { query } from "./query.ts";
import { Entity } from "../entity/index.ts";
import { Component, } from "../component/index.ts";
import { Relationship } from "../relationship/index.ts";
import { assertTypesEqual } from "../utils/type-assertions.ts";

describe("Empty query", () => {
  it("Finds nothing (empty tuples) when input is empty tuple", () => {
    // Arrange
    const { all } = createEntities({ count: 3 });

    // Act
    const result = query(all, []);

    // Assert
    assertTypesEqual<typeof result, []>(true);
    assert.deepStrictEqual(result, []);
  });

  it("Finds nothing (empty objects) when input is empty object", () => {
    // Arrange
    const { all } = createEntities({ count: 3 });

    // Act
    const result = query(all, {});

    // Assert
    assertTypesEqual<typeof result, {}>(true);
    assert.deepStrictEqual(result, {});
  });
});

describe("Entity instance query", () => {
  it("Finds specific entity instance", () => {
    // Arrange
    const { all, entities } = createEntities({ count: 3 });

    // Act
    const result = query(all, [entities[1]]);

    // Assert
    assertTypesEqual<typeof result, [Entity]>(true);
    assert.deepStrictEqual(result, [entities[1]]);
  });

  it("Finds specific component type", () => {});

  it("Find specific relationship type", () => {});

  it("Can find multiple different entities in single query", () => {});

  it("Can find same entity multiple times in single query", () => {});

  it("Does not find entity if not on the list", () => {});
});

describe("Entity wildcard query", () => {
  it("Finds all entities", () => {});

  it("Finds all component types", () => {});

  it("Finds all relationship types", () => {});

  it("Finds nothing when entity list is empty", () => {});

  it("Can give entity wildcard reference name", () => {});

  it("Find the same entity multiple times", () => {});

  it("Can specify that an entity may only be found once for a wildcard", () => {});

  it("Can specify multiple wildcards", () => {});

  it("Can specify multiple wildcards with different reference names", () => {});

  it("Can specify multiple wildcards with same reference name", () => {});

  it("Can specify that one wildcard may only be found once, while other may be found multiple times", () => {});

  it("Can find entity combinations", () => {});
});

describe("Entity type query", () => {
  it("Finds that type of base entities are Entity", () => {});

  it("Finds that type of component types are the component types", () => {});

  it("Finds that type of relationship types are the relationship types", () => {});

  it("Can specify reference name for entity type", () => {});

  it("Can find the same entity type multiple times", () => {});

  it("Can find the same entity type multiple times in the same query", () => {});

  it("Can specify that an entity type may only be found once for a given query", () => {});

  it("Can specify that an entity type may only be found once, while another may be found multiple times", () => {});
});

describe("Component instance query", () => {
  it("Finds tag components on entities", () => {});

  it("Finds value component on entities", () => {});

  it("Can find multiple different component values in single query", () => {});

  it("Can find same component value multiple times in single query", () => {});

  it("Does not find component value if not on an entity", () => {});

  it("Finds component value on specific entity", () => {});

  it("Finds component value on entity reference", () => {});

  it("Finds component value on any entity using wildcard", () => {});

  it("Finds component value on any component type using wildcard", () => {});

  it("Finds component value on any relationship type using wildcard", () => {});

  it("Does not find component value on specific entity if it does not have it", () => {});

  it("Does not find component value on specific entity if entity not in list", () => {});

  it("Finds entity with the specific component", () => {});

  it("Does not find anything if query only has partial match", () => {});
});

describe("Component wildcard query", () => {
  it("Finds all components", () => {});

  it("Finds all components on specific entity", () => {});

  it("Finds all components on references entity", () => {});

  it("Finds all components on any entity", () => {});

  it("Finds all components on any component", () => {});

  it("Finds all components on any relationship", () => {});

  it("Finds all components and their attached entity by reference", () => {});

  it("Can specify reference name for found component (not for found values)", () => {});

  it("Can find the same component multiple times", () => {});

  it("Can specify that a given component type may only be found once", () => {});

  it("Can find the same component value with two different wildcards", () => {});

  it("Can specify that a given component type may only be found once, while another may be found multiple times", () => {});
});

describe("Component type query", () => {
  it("Find all component types", () => {});

  it("Can specify reference name of component type", () => {});

  it("Can use component type reference to find components of type", () => {
    // Component.type().as("type"), Component.as("type")
  });

  it("Can find the same component type multiple times", () => {});

  it("Can specify that a given component type may only be found once", () => {});

  it("Can specify that a given component type may only be found once, while another may be found multiple times", () => {});

  it("Can specify source entity of component type", () => {});

  it("Can specify source reference of component type", () => {});

  it("Can specify entity wildcard as source of component type", () => {});

  it("Can specify component wildcard as source of component type", () => {});

  it("Can specify relationship wildcard as source of component type", () => {});
});

describe("Relationship instance query", () => {
  it("Finds tag relationship on entities", () => {});

  it("Finds value relationship on entities", () => {});

  it("Can find multiple different relationship values in single query", () => {});

  it("Can find same relationship value multiple times in single query", () => {});

  it("Does not find relationship value if not on an entity", () => {});

  it("Finds relationship value on specific entity", () => {});

  it("Finds relationship value on entity reference", () => {});

  it("Finds relationship value on any entity using wildcard", () => {});

  it("Finds relationship value on any component type using wildcard", () => {});

  it("Finds relationship value on any relationship type using wildcard", () => {});

  it("Finds relationship value to specific entity", () => {});

  it("Finds relationship value to entity reference", () => {});

  it("Finds relationship value to any entity using wildcard", () => {});

  it("Finds relationship value to any component type using wildcard", () => {});

  it("Finds relationship value to any relationship type using wildcard", () => {});

  it("Does not find relationship value on specific entity if it does not have it", () => {});

  it("Does not find relationship value on specific entity if entity not in list", () => {});

  it("Finds entity with the specific relationship", () => {});

  it("Finds explicit relationship to self", () => {});

  it("Finds transitive relationship to self by reference", () => {});
});

describe("Relationship wildcard query", () => {
  it("Finds all relationships", () => {});

  it("Finds all relationships on specific entity", () => {});

  it("Finds all relationships on references entity", () => {});

  it("Finds all relationships on any entity", () => {});

  it("Finds all relationships on any component", () => {});

  it("Finds all relationships on any relationship", () => {});

  it("Finds all relationships and their source entity by reference", () => {});

  it("Finds all relationships to specific entity", () => {});

  it("Finds all relationships to references entity", () => {});

  it("Finds all relationships to any entity", () => {});

  it("Finds all relationships to any component", () => {});

  it("Finds all relationships to any relationship", () => {});

  it("Finds all relationships and their target entity by reference", () => {});

  it("Can specify reference name for found relationship (not for found values)", () => {});

  it("Can find the same relationship multiple times", () => {});

  it("Can specify that a given relationship type may only be found once", () => {});

  it("Can find the same relationship value with two different wildcards", () => {});

  it("Can specify that a given relationship type may only be found once, while another may be found multiple times", () => {});

  it("Finds direct circular relationship", () => {});

  it("Finds transitive circular relationship", () => {});
});

describe("Relationship type query", () => {
  it("Find all relationship types", () => {});

  it("Can specify reference name of relationship type", () => {});

  it("Can use relationship type reference to find relationship of type", () => {
    // Relationship.type().as("type"), Relationship.as("type")
  });

  it("Can find the same relationship type multiple times", () => {});

  it("Can specify that a given relationship type may only be found once", () => {});

  it("Can specify that a given relationship type may only be found once, while another may be found multiple times", () => {});

  it("Can specify source entity of relationship type", () => {});

  it("Can specify source reference of relationship type", () => {});

  it("Can specify entity wildcard as source of relationship type", () => {});

  it("Can specify component wildcard as source of relationship type", () => {});

  it("Can specify relationship wildcard as source of relationship type", () => {});

  it("Can specify target entity of relationship type", () => {});

  it("Can specify target reference of relationship type", () => {});

  it("Can specify entity wildcard as target of relationship type", () => {});

  it("Can specify component wildcard as target of relationship type", () => {});

  it("Can specify relationship wildcard as target of relationship type", () => {});
});

describe("Ordering of query parts", () => {
  it("Ordering of query parts does not matter", () => {});
});

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
