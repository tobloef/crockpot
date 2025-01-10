# Wonkyness

The way that relationship components are not assumed to be stored in the world, yet you can still add components to them. Like `Likes.to(player).add(Serializable)`, which would not show up if you did `query(Serializable)`.

Similarly, look at this horror: `Likes.to(Likes).add(Likes.to(Likes.to(Likes)));`


```
[
  Relationship.as("rel").on("comp"),
  Component.as("comp"),
  Relationship.as("rel").on("comp").value(),
]
```
vs
```
[
  Relationship.as("rel").on("comp"),
  Component.as("comp"),
  Relationship.as("rel").value(),
]
```
Should it be able to infer the target of the last part?

Fun thought: The querying API is declarative. We're saying what data we want, not how to get it.

Inferring string reference types is _purely_ for the mad science of it. You could very easily do `query([Person.to("t"), Transform.as("t")])` instead of `query([Person.to(Transform.as("t")), "t"])`. Or even:

```ts
const ship = Spaceship.as('ship')
const planet = Planet.as('planet')
const shipFaction = Faction.as('ship faction')
const planetFaction = Faction.as('planet faction')

graph.query(
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
      either(
        Allied.with(shipFaction),
        Belongs.from(ship),
      )
    )
  ]
);
```

instead of:

```ts
graph.query(
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
      either(
        Allied.with("ship faction"),
        Belongs.from("ship"),
      )
    )
  ]
);
```

Or if you wanted to avoid strings completely:

```ts
const ship = new Wildcard(Spaceship);
const planet = new Wildcard(Planet);
const shipFaction = new Wildcard(Faction);
const planetFaction = new Wildcard(Faction);

graph.query(
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
      either(
        Allied.with(shipFaction),
        Belongs.from(ship),
      )
    )
  ]
);
```

Or something to that effect.

But having _some_ amount of strings does at least make it very short to write, especially for small single-line queries. But the "infer return type" shit is still fully unnecessary lmao.