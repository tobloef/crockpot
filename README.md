![Crockpot](https://github.com/user-attachments/assets/2b89a924-0c07-459e-a8f8-a13b43e07b13)

### An experimental Graph Component System (GCS) library for TypeScript game development 🥘

Crockpot is essentially an in-memory graph database for real-time applications. By structuring game logic as systems that act on a world of nodes and edges, you can achieve a high level of composability.

In this regard, it fills much of the same niche as an [Entity Component System (ECS)](https://en.wikipedia.org/wiki/Entity_component_system), though admittedly without the same cache-friendly data layouts  that many ECS libraries have (yet!). In comparison to ECS though, Crockpot dispenses with the concept of an "entity" and takes an entirely graph-first approach to the same problem, making both querying and reasoning about the data much more intuitive.

Crockpot features a powerful graph querying API, entirely type-safe thanks to [a mountain of TypeScript](https://github.com/tobloef/crockpot/blob/main/src/query/run-query.types.ts). You can see some examples below.

> [!WARNING]
> This project is in very active development and should not be used! The API is currently undergoing a major rewrite, and likewise for many of the underlying systems.

## Examples

### Hello, Crockpot!

```typescript
class Vector2 extends Node {
  constructor(
    public x: numebr,
    public y: number,
  ) {}
}

class Position extends Vector2 {}
class Velocity extends Vector2 {}

class Has extends Edge {}

const graph = new Graph();

const player = graph.addNode(new Node());
player.addEdge({ edge: new Has(), to: new Position(0, 0) ]);
player.addEdge({ edge: new Has(), to: new Velocity(1, 2) ]);

const results = graph.query({
  pos: Position.from("some node"),
  vel: Velocity.from("some node"),
]);

for (const { pos, vel } of results) {
  position.x = velocity.x;
  position.y = velocity.y;
}
```

### Sander's Spaceships

```typescript
// Finds spaceships docked to planets that are ruled by factions
// that are allied with the faction of the spaceship.
graph.query(
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
```

## Acknowledgements

The initial idea for Crockpot was heavily inspired by the articles of Sander Mertens, especially [Why it is time to start thinking of games as databases](https://ajmmertens.medium.com/why-it-is-time-to-start-thinking-of-games-as-databases-e7971da33ac3) and [Building Games in ECS with Entity Relationships](https://ajmmertens.medium.com/building-games-in-ecs-with-entity-relationships-657275ba2c6c).
