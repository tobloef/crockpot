import { Graph, Node, Edge } from "../../../src/index.ts";
import { sleep } from "../../../src/utils/sleep.ts";

class Spaceship extends Node {
  name: string;
  constructor(name: string) {
    super(); this.name = name;
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

// await sleep(100);

// Finds spaceships docked to planets that are ruled by factions
// that are allied with the faction of the spaceship.
const result = graph.query(
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
).toArray();

console.log(`Found ${result.length?.toLocaleString()} spaceships.`);