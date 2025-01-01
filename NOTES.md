* Wonkyness
  * The way that relationship components are not assumed to be stored in the world, yet you can still add components to them. Like `Likes.to(player).add(Serializable)`, which would not show up if you did `query(Serializable)`.
  * Similarly, look at this horror: `Likes.to(Likes).add(Likes.to(Likes.to(Likes)));`