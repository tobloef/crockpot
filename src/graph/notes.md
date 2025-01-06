# Notes

## API

### Querying

`Node`
Any Node,

`Node.with(Transform)`
Node with any edge to or from a Transform node.

`Node.with(Transform.with(Transform))`
Node with any edge to or from a Transform node with any edge to or from a Transform node.

`Node.with(Edge.to(Transform))`
Node with any edge to a transform node.

`Node.with(Edge.from(Transform))`
Node with any edge from a transform node.

`[Transform, Transform]`
All pairs of position nodes (doesn't have to be connected)

`[Node.with(Edge.to("x")), "x"]`
All pairs of nodes with an edge to any other node and that connected node.

`[Node.with("t"), Transform.as("t")]`
All pairs of nodes with any edge to or from a Transform node and that Transform node.

`[Node.with("x"), "x"]`
All pairs of nodes with any edge between them.

`Node.with(ChildOf.to(Node))`
Any node with a ChildOf edge to another node.

`Person.with(tobias)`
Any Person node with an edge to or from the tobias node.

```js
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
```

All spaceships, planets and factions, where the spaceship is docked to the planet, which is ruled by a faction which is either the ship's faction or a faction allied with the ship's faction.

```js
either(
  Person.with(tobias),
  Person.with(Person.with(tobias)),
  Person.with(Person.with(Person.with(tobias))),
  // Etc.
);
```

Anyone in Tobias' social network (up to a depth of 3).

## Misc.

If you want to look into performance, then working more _with_ the JIT is also a great possibility for optimization.