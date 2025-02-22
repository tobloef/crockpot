export function setup({
  crockpot,
  rng,
}: any) {
  const OTHER_SPACESHIPS = 10000;
  const OTHER_FACTIONS = 100;
  const OTHER_PLANETS = 1000;
  const OTHER_ALLIANCES = 100;
  const OTHER_DOCKINGS = 500;
  const OTHER_RULES = 100;
  const OTHER_IS_INS = 10000;

  const { Graph, Node, Edge } = crockpot;

  class Spaceship extends Node {
    name: string;

    constructor(name: string) {
      super();
      this.name = name;
    }
  }

  class Faction extends Node {}

  class Planet extends Node {}

  class Allied extends Edge {}

  class RuledBy extends Edge {}

  class Docked extends Edge {}

  class IsIn extends Edge {}

  const graph = new Graph();

  const empire = graph.addNode(new Faction());
  const rebels = graph.addNode(new Faction());
  const bountyHunters = graph.addNode(new Faction());

  const deathStar = graph.addNode(new Spaceship("Death Star"));
  const millenniumFalcon = graph.addNode(new Spaceship("Millennium Falcon"));
  const tieFighter = graph.addNode(new Spaceship("Tie Fighter"));
  const bountyShip = graph.addNode(new Spaceship("Bounty Ship"));

  const alderaan = graph.addNode(new Planet());
  const tatooine = graph.addNode(new Planet());
  const endor = graph.addNode(new Planet());

  // I haven't watched Star Wars, don't @ me
  deathStar.addEdge({ edge: new IsIn(), to: empire });
  tieFighter.addEdge({ edge: new IsIn(), to: empire });
  millenniumFalcon.addEdge({ edge: new IsIn(), to: rebels });
  bountyShip.addEdge({ edge: new IsIn(), to: bountyHunters });

  alderaan.addEdge({ edge: new RuledBy(), to: empire });
  tatooine.addEdge({ edge: new RuledBy(), to: empire });
  endor.addEdge({ edge: new RuledBy(), to: rebels });

  deathStar.addEdge({ edge: new Docked(), to: alderaan });
  millenniumFalcon.addEdge({ edge: new Docked(), to: tatooine });
  tieFighter.addEdge({ edge: new Docked(), to: endor });
  bountyShip.addEdge({ edge: new Docked(), to: tatooine });

  empire.addEdge({ edge: new Allied(), to: bountyHunters });
  empire.addEdge({ edge: new Allied(), to: empire });
  rebels.addEdge({ edge: new Allied(), to: rebels });
  bountyHunters.addEdge({ edge: new Allied(), to: bountyHunters });

  const otherSpaceships = Array.from({ length: OTHER_SPACESHIPS }, (_, i) => {
    return graph.addNode(new Spaceship(`Spaceship ${i}`));
  });

  const otherFactions = Array.from({ length: OTHER_FACTIONS }, (_, i) => {
    return graph.addNode(new Faction());
  });

  const otherPlanets = Array.from({ length: OTHER_PLANETS }, (_, i) => {
    return graph.addNode(new Planet());
  });

  const otherAlliances = Array.from({ length: OTHER_ALLIANCES }, (_, i) => {
    const faction1 = otherFactions[Math.floor(rng() * OTHER_FACTIONS)];
    const faction2 = otherFactions[Math.floor(rng() * OTHER_FACTIONS)];
    return faction1.addEdge({ edge: new Allied(), to: faction2 });
  });

  const otherRules = Array.from({ length: OTHER_RULES }, (_, i) => {
    const planet = otherPlanets[Math.floor(rng() * OTHER_PLANETS)];
    const faction = otherFactions[Math.floor(rng() * OTHER_FACTIONS)];
    return planet.addEdge({ edge: new RuledBy(), to: faction });
  });

  const otherDockings = Array.from({ length: OTHER_DOCKINGS }, (_, i) => {
    const spaceship = otherSpaceships[Math.floor(rng() * OTHER_SPACESHIPS)];
    const planet = otherPlanets[Math.floor(rng() * OTHER_PLANETS)];
    return spaceship.addEdge({ edge: new Docked(), to: planet });
  });

  const otherIsIns = Array.from({ length: OTHER_IS_INS }, (_, i) => {
    const spaceship = otherSpaceships[Math.floor(rng() * OTHER_SPACESHIPS)];
    const faction = otherFactions[Math.floor(rng() * OTHER_FACTIONS)];
    return spaceship.addEdge({ edge: new IsIn(), to: faction });
  });

  return {
    graph,
    classes: {
      Spaceship,
      Faction,
      Planet,
      Allied,
      RuledBy,
      Docked,
      IsIn,
    }
  }
}

export function run(props: ReturnType<typeof setup>) {
  const {
    graph,
    classes: {
      Spaceship,
      Faction,
      Planet,
      Allied,
      RuledBy,
      Docked,
      IsIn,
    }
  } = props;

  // Finds spaceships docked to planets that are ruled by factions
  // that are allied with the faction of the spaceship.
  const results = graph.query(
    Spaceship.with(
      IsIn.to(
        Faction.as("faction")
      ),
      Docked.to(
        Planet.with(
          RuledBy.to(
            Faction.with(
              Allied.to(
                Faction.as("faction")
              )
            )
          )
        )
      )
    ),
  );

  let checksum = 0;

  for (const node of results) {
    checksum += node.id.length;
  }

  return checksum;
}

