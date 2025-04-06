// noinspection JSUnresolvedReference
// language=JavaScript
`
// Spaceship example

query()
	.match(
		Spaceship("ship")
			.with(Docked)
			.to(Planet)
			.with(RuledBy)
			.to(Faction)
			.with(Allied)
			.to(Faction)
			.with(IsIn)
			.from("ship")
	)
	.return("ship");

query()
		.match(Spaceship("ship"))
		.with(Docked)
		.to(Planet)
		.with(RuledBy)
		.to(Faction)
		.with(Allied)
		.to(Faction)
		.with(IsIn)
		.from("ship")
		.return("ship");

query()
	.match(
		Spaceship("ship"),
		has(Docked),
		to(Planet),
		has(RuledBy),
		to(Faction),
		has(Allied),
		to(Faction),
		has(IsIn),
		from("ship"),
	)
	.return("ship");

query()
	.match(
		Spaceship("ship")
			.with(Docked, to, Planet)
			.with(RuledBy, to, Faction)
			.with(Allied, to, Faction)
			.with(IsIn, from, "ship")
	)
	.return("ship");

// Global transforms example

query()
	.match(
		GlobalTransform("global")
			.with(IsGlobalOf)
			.to(LocalTransform("local"))
			.maybe.with(IsParentOf)
			.from(LocalTransform)
			.with(IsGlobalOf)
			.from(GlobalTransform("parentGlobal"))
	)
	.return("local", "global", "parentGlobal");

query()
	.match(
		GlobalTransform("global")
			.with(IsGlobalOf, to, LocalTransform("local"))
			.maybe.with(IsParentOf, from, LocalTransform)
			.with(IsGlobalOf, from, GlobalTransform("parentGlobal"))
	)
	.return("local", "global", "parentGlobal");

query()
	.match(
		LocalTransform("local"),
		GlobalTransform("global")
			.with(IsGlobalOf, to, "local"),
		optional(
			GlobalTransform("parentGlobal")
				.with(IsGlobalOf, to, LocalTransform)
				.with(IsParentOf, to, "local")
		)
	)
	.return("local", "global", "parentGlobal");

query()
	.match(
		LocalTransform("local"),
		GlobalTransform("global").with(IsGlobalOf, to, "local"),
		optional(
			LocalTransform("parentLocal").with(IsParentOf, to, "local"),
			GlobalTransform("parentGlobal").with(IsGlobalOf, to, "parentLocal"),
		),
	)
	.return("local", "global", "parentGlobal");

query()
	.match(
		LocalTransform("local"),
		GlobalTransform("global").with(IsGlobalOf, to, "local"),
		optional(LocalTransform("parentLocal").with(IsParentOf, to, "local")),
		optional(GlobalTransform("parentGlobal").with(IsGlobalOf, to, "parentLocal")),
	)
	.return("local", "global", "parentGlobal");

query()
	.match(
		LocalTransform("local")
			.with(IsGlobalOf, from, GlobalTransform("global"))
	)
	.optional(
		GlobalTransform("parentGlobal")
			.with(IsGlobalOf, to, LocalTransform)
			.with(IsParentOf, to, "local")
	)
	.return("local", "global", "parentGlobal");

query()
	.match(
		GlobalTransform.as("global")
			.with(IsGlobalOf, to, LocalTransform.as("local"))
			.withOptional(IsParentOf, from, LocalTransform)
			.with(IsGlobalOf, from, GlobalTransform.as("parentGlobal"))
	)
	.return("local", "global", "parentGlobal");

// Velocity example

query()
	.match(
		Node.withAll(
			Edge.to(Position("pos")),
			Edge.to(Velocity("vel")),
		)
	).return("pos", "vel");

query()
	.match(
		Node.withAll(
			[Edge, to, Position("pos")],
			[Edge, to, Velocity("vel")],
		)
	).return("pos", "vel");

query()
	.match(
		Node.with(
			[Edge, to, Position("pos")],
			[Edge, to, Velocity("vel")],
		)
	).return("pos", "vel");

query()
	.match(
		Node.toAll(
			Position.as("pos"),
			Velocity.as("vel"),
		)
	).return("pos", "vel");

query()
	.match(
		Node.to(
			Position("pos"),
			Velocity("vel"),
		)
	).return("pos", "vel");
`;

/*
Takeaways:

 I don't like the `.maybe.foo()` syntax. Just use `.maybeFoo()`.

 Similarly, the `Node("name")` syntax also has poor discoverability.

 The `.with(edge, direction, node)` syntax is really nice, actually.

 I like `.withOptional()` more than `.maybeWith()`, it reads nicer together with the `.with()`.

 Just keep it simple and use `.withAll()` instead of overloading `.with()`.

 I don't know what to think of having multiple match/optional terms yet.
 On the one hand, it is a little easier to reason about. You can just kinda declare
 "I have this thing, this thing and this thing, and they are related in these ways",
 without having to think much about the order.
 On the other hand, it creates the potential for creating disjoint queries.
 You would have to check at parse-time if that was the case, and reject the query if so.
 Assuming that you don't want to deal with disjoint query parts of course.
 */
