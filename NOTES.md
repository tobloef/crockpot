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