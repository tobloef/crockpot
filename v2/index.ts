import {
  Graph,
} from "./graph.ts";
import { GraphNode } from "./node.ts";

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

class Spaceship extends GraphNode { }
class Planet extends GraphNode {
  planetName: string = "Earth";
  static planetType: string = "Terrestrial";
}
class Faction extends GraphNode { }

class Owns extends GraphEdge { }
class Rules extends GraphEdge { }
class AlliesWith extends GraphEdge { }

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
  // @ts-expect-error
  alliance: ["ship", AlliesWith, "planet"],
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

const spaceshipExample1000 = graph.query({
  ship: Spaceship,
  shipFaction: Faction,
  // @ts-expect-error
  owns: ["shipFactasdion", Owns, "asdasd"],

  planet: Planet,
  planetFaction: Faction,
  // @ts-expect-error
  rules: ["asdasd", Rules, "asdasd"],

  // @ts-expect-error
  alliesWith: ["asdasd", AlliesWith, "asdasd"],
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

const spaceshipExample2000 = graph.query({
  // @ts-expect-error
  ship: {
    spaceship: Spaceship,
    faction: Faction,
    owns: ["ship.factasdion", Owns, "ship.spaceship"],
  },
  // @ts-expect-error
  planet: {
    planet: Planet,
    faction: Faction,
    rules: ["planet.faction", Rules, "planet.pasdlanet"],
  },
  // @ts-expect-error
  alliance: ["shsdaip.faction", AlliesWith, "planet.faction"],
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

const spaceshipExampleWithAnyOf2 = graph
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
      one: {
        foo: GraphNode,
        alliance: [ "ship.faction", AlliesWith, "planet.faction" ],
        bar: [ "one.foo", GraphEdge, "ship.spaceship" ]
      }
    },
    {
      two: {
        rules: ["planet.faction", Rules, "planet.planet"]
      }
    },
  )
  .run();

const simple = graph
  .query({
    boop: GraphNode,
    beep: GraphNode,
    ship: {
      boop: GraphNode,
      beep: GraphNode,
    },
    planet: {
      boop: GraphNode,
      beep: GraphNode,
    },
  })
  .anyOf(
    {
      one: {
        foo: GraphNode,
        alliance: [ "boop", AlliesWith, "boop" ],
        bar: [ "boop", GraphEdge, "boop" ]
      }
    },
    {
      two: {
        foo: GraphNode,
        alliance: [ "boop", AlliesWith, "boop" ],
        bar: [ "boop", GraphEdge, "boop" ]
      }
    },
  )
  .run();

////////////////////////////////////////////////////////////////////////////////

class LocalTransform extends GraphNode { }
class GlobalTransform extends GraphNode { }
class IsGlobalOf extends GraphEdge { }
class IsParentOf extends GraphEdge { }

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
      isGlobalOf: ["parent.local", IsGlobalOf, "parent.global"],
      isParentOf: ["parent.local", IsParentOf, "local"],
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
      isParentOf: ["parent.local", IsParentOf, "local"],
    }
  })
  .optional({
    lolol: ["parent.local", IsParentOf, "local"]
  })
  .run()
