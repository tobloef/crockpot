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
			.optionally.with(IsParentOf, from, LocalTransform)
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
			Position("pos"),
			Velocity("vel"),
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
