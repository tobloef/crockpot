import { Graph } from "./graph.ts";
import { Node } from "./node.ts";
import { Edge } from "./edge.ts";
import type { ArrayQueryOutput } from "./query.types.ts";
import type { Class } from "./utils/class.ts";

class Transform extends Node {}

class Person extends Node {}

class ChildOf extends Edge {}

const graph = new Graph();

const tobias = new Person();
graph.addNode(tobias);

const r1 = graph.query(
  Node
);

const r2 = graph.query(
  Edge
);

const r3 = graph.query(
  Node.with(Transform)
);

const r4 = graph.query(
  Node.to(Transform)
);

const r5 = graph.query(
  Node.from(Transform)
);

const r6 = graph.query(
  Node.with(ChildOf)
);

const r7 = graph.query(
  Node.with(ChildOf.to(Node))
);

const r8 = graph.query(
  Node.with(ChildOf.from(Node))
);

const r9 = graph.query(
  Node.with(Transform.with(Transform))
);

const r10 = graph.query(
  Node.with(Edge.to(Transform))
);

const r11 = graph.query(
  Node.with(Edge.from(Transform))
);

const r12a = graph.query(
  Transform
);

type FakeInput = [Class<Transform>];
type X = ArrayQueryOutput<FakeInput, FakeInput>;

const r12b = graph.query(
  [Transform]
);

const r12c = graph.query(
  [Transform, Transform]
);

const r12d = graph.query(
  {Transform}
);

const r13 = graph.query(
  [Node.with(Edge.to("x")), "x"]
);

const r14 = graph.query(
  [Node.with("t"), Transform.as("t")]
);

const r15a = graph.query(
  [Node.as("x"), "x"]
);

const r15b = graph.query(
  [Person.as("x"), "x"]
);

const r15c = graph.query(
  [Person.with(Transform.as("x")), "x"]
);

const r16 = graph.query(
  Node.with(ChildOf.to(Node))
);

const r17 = graph.query(
  Person.with(tobias)
);

class Spaceship extends Node {}
class Faction extends Node {}
class Planet extends Node {}
class Belongs extends Edge {}
class Docked extends Edge {}
class RuledBy extends Edge {}
class Allied extends Edge {}

const r18 = graph.query(
  [
    Spaceship.as("ship").with(
      Belongs.to("ship faction"),
      Docked.to("planet"),
    ),
    Faction.as("ship faction"),
    Planet.as("planet").with(
      RuledBy.to("planet faction"),
    ),
    Faction.as("planet faction").with(
      Allied.with("ship faction"),
    )
  ]
);

class Position extends Node {}
class Velocity extends Node {}

const r20 = graph.query(
  [Position.from("n"), Velocity.from("n")]
);

const r21 = graph.query(
  Node.with(ChildOf.to("x"))
);

const r22 = graph.query(
  Node.with(ChildOf.to("x"))
);

const ship = Spaceship.as('ship')
const planet = Planet.as('planet')
const shipFaction = Faction.as('ship faction')
const planetFaction = Faction.as('planet faction')

const r23 = graph.query(
  [
    ship.with(
      Belongs.to(shipFaction),
      Docked.to(planet),
    ),
    shipFaction,
    planet.with(
      RuledBy.to(planetFaction),
    ),
    planetFaction.with(
      Allied.with(shipFaction),
    )
  ]
);

const r24 = graph.query(
  [Person.to("x"), "x"]
);

const r25 = graph.query(
  [
    Person.with(Edge.as("e").to(Transform)),
    Transform.with(Edge.from(Person)),
  ]
)