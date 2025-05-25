import {
  Graph,
  Query,
} from "./graph.ts";
import { GraphNode } from "./node.ts";
import { optional } from "./optional.js";
import type {
  ArrayOfArrayOfNodeKeys,
  QueryInput,
} from "./query-input.js";

class SomeNode extends GraphNode {
  #brand = "SomeNode" as const;
}

class OtherNode extends GraphNode {
  #brand = "OtherNode" as const;
}

class SomeEdge extends GraphEdge {
  #brand = "SomeEdge" as const;
}

class OtherEdge extends GraphEdge {
  #brand = "OtherEdge" as const;
}

const graph = new Graph();
const result = graph.query({
  a: GraphNode,
  b: ["a", GraphEdge, "c.a"],
  c: {
    a: SomeNode,
    b: ["c.a", SomeEdge, "c.c.a"],
    c: {
      a: OtherNode,
      b: ["a", OtherEdge, "c.a"],
    }
  },
});

////////////////////////////////////////////////////////////////////////////////

class Spaceship extends GraphNode {}
class Planet extends GraphNode {}
class Faction extends GraphNode {}

class Owns extends GraphEdge {}
class Rules extends GraphEdge {}
class AlliesWith extends GraphEdge {}

const spaceshipExample0 = graph.query({
  ship: {
    spaceship: Spaceship,
    faction: Faction,
    owns: ["ship.faction", Owns, "ship.spaceship"],
  },
  planet: {
    planet: Planet,
    faction: Faction,
    rules: ["planet.faction", Rules, "planet.planet"],
  },
  alliance: ["ship", AlliesWith, "planet"], // TODO: Should not be allowed
}).run();

const spaceshipExample1 = graph.query({
  ship: Spaceship,
  shipFaction: Faction,
  owns: ["shipFaction", Owns, "ship"],

  planet: Planet,
  planetFaction: Faction,
  rules: ["planetFaction", Rules, "planet"],

  alliesWith: ["shipFaction", AlliesWith, "planetFaction"],
}).run();

const spaceshipExample2 = graph.query({
  ship: {
    spaceship: Spaceship,
    faction: Faction,
    owns: ["ship.faction", Owns, "ship.spaceship"],
  },
  planet: {
    planet: Planet,
    faction: Faction,
    rules: ["planet.faction", Rules, "planet.planet"],
  },
  alliance: ["ship.faction", AlliesWith, "planet.faction"],
});

const spaceshipExampleWithAnyOf = graph
  .query({
    ship: {
      spaceship: Spaceship,
      faction: Faction,
      owns: ["ship.faction", Owns, "ship.spaceship"],
    },
    planet: {
      planet: Planet,
      faction: Faction,
      rules: ["planet.faction", Rules, "planet.planet"],
    },
  })
  .anyOf(
    {
      alliance: ["ship.faction", AlliesWith, "planet.faction"],
      foo: GraphNode,
      bar: ["foo", GraphEdge, "ship.spaceship"]
    },
    {
      rules: ["planet.faction", Rules, "planet.planet"]
    },
  )
  .run();

const simple = graph
  .query({
    foo: GraphNode,
  })
  .anyOf(
    {
      bar: GraphNode,
      baz: ["foo", GraphEdge, "plonk"],
    },
    {
      plonk: GraphNode,
      baz: ["foo", GraphEdge, "bar"],
    },
  );

type Keys<Q extends Query<any, any, any, any>> = (
  Q extends Query<infer Base, infer Optional, infer Without, infer AnyOf>
    ? ArrayOfArrayOfNodeKeys<AnyOf>
    : "oof"
)

type Test = Keys<typeof simple>;

const spaceshipExampleWithAnyOf = graph
  .query({
    ship: {
      spaceship: Spaceship,
      faction: Faction,
      owns: ["ship.faction", Owns, "ship.spaceship"],
    },
    planet: {
      planet: Planet,
      faction: Faction,
      rules: ["planet.faction", Rules, "planet.planet"],
    },
  })
  .anyOf(
    {
      alliance: ["ship.faction", AlliesWith, "planet.faction"],
      foo: GraphNode,
      bar: ["foo", GraphEdge, "ship.spaceship"]
    },
    {
      rules: ["planet.faction", Rules, "planet.planet"]
    },
  )
  .optional({
    optionalNode: GraphNode,
    optionalEdge: ["optionalNode", GraphEdge, "foo"], // TODO: Should not be allowed
  })
  .run();

////////////////////////////////////////////////////////////////////////////////

class LocalTransform extends GraphNode {}
class GlobalTransform extends GraphNode {}
class IsGlobalOf extends GraphEdge {}
class IsParentOf extends GraphEdge {}

const transformExample = graph
  .query({
    local: LocalTransform,
    global: GlobalTransform,
    isGlobalOf: ["local", IsGlobalOf, "global"],
  })
  .optional({
    parent: {
      local: LocalTransform,
      global: GlobalTransform,
      isGlobalOf: [ "parent.local", IsGlobalOf, "parent.global" ],
      isParentOf: [ "parent.local", IsParentOf, "local" ],
    },
  })
  .optional({
    foo: GraphNode,
    lol: ["parent.global", GraphEdge, "foo"],
  })
  .run()

////////////////////////////////////////////////////////////////////////////////

const rootTransformsExample = graph
  .query({
    local: LocalTransform,
    global: GlobalTransform,
    isGlobalOf: ["local", IsGlobalOf, "global"],
  })
  .without({
    parent: {
      local: LocalTransform,
      isParentOf: [ "parent.local", IsParentOf, "local" ],
    }
  })
  .optional({
    lolol: [ "parent.local", IsParentOf, "local" ] // TODO: Should not be allowed
  })
  .run()
