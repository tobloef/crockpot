A few different ways of representing the spaceship query:

```js
const generator1 = query([
  Spaceship.as("ship"),
  Planet.as("planet"),
  Faction.as("ship faction"),
  Faction.as("planet faction"),
  DockedTo.from("ship").to("planet"),
  BelongsTo.from("ship").to("ship faction"),
  RuledBy.from("planet").to("planet faction"),
  oneOf(
    AlliedWith.from("ship faction").to("planet faction"),
    BelongsTo.from("ship").to("planet faction"),
  )
]);

const generator2 = query([
  BelongsTo
    .from(Spaceship.as("ship"))
    .to(Faction.as("ship faction")),
  RuledBy
    .from(Planet.as("planet"))
    .to(Faction.as("planet faction")),
  DockedTo.from("ship").to("planet"),
  oneOf(
    AlliedWith.from("ship faction").to("planet faction"),
    BelongsTo.from("ship").to("planet faction"),
  )
]);

const generator3 = query([
  Spaceship.with(
    BelongsTo.to(Faction.as("ship faction")),
    DockedTo.to(Planet.with(
      oneOf(
        RuledBy.to("ship faction"),
        RuledBy.to(Faction.with(
          AlliedWith.from("ship faction"),
        )),
      )
    )),
  ),
]);

const generator4 = query([
  Spaceship.with(
    BelongsTo.to(Faction.as("ship faction")),
    DockedTo.to(Planet.with(
      RuledBy.to(oneOf(
        "ship faction",
        Faction.with(
          AlliedWith.from("ship faction"),
        )
      )),
    )),
  ),
]);

const generator5 = query([
  Spaceship.with(
    BelongsTo.to(Faction.as("ship faction")),
    DockedTo.to("planet"),
  ),
  Planet.with(
    RuledBy.to(oneOf(
      "ship faction",
      Faction.with(
        AlliedWith.from("ship faction"),
      )
    )),
  ),
]);
```