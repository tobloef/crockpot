// noinspection JSUnresolvedReference
// language=JavaScript
`
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
`;

////////////////////////////////////////////

graph
	.query(
		Node.toAll(
			Position.as("pos"),
			Velocity.as("vel"),
		)
	)
	.return("pos", "vel");

graph
	.query(
		Spaceship.as("ship")
			.with(Docked.to(Planet.as("planet")))
			.with(RuledBy.to(Faction.as("planet rulers")))
			.with(Allied.to(Faction.as("ship owners")))
			.with(OwnedBy.from("ship", "ship owners"))
	)
	.return("ship");

////////////////////////////////////////////

graph
	.query(
		Node("n"),
		Position("pos"),
		Velocity("vel"),
		Edge("n", "pos"),
		Edge("n", "vel"),
	)
	.return("pos", "vel");

graph
	.query(
		Spaceship("ship"),
		Planet("planet"),
		Faction("ship owners"),
		Faction("planet rulers"),
		OwnedBy("ship", "ship owners"),
		RuledBy("planet", "planet rulers"),
		Allied("planet rulers", "ship owners"),
	)
	.return("ship");

graph
	.query(
		LocalTransform("local"),
		GlobalTransform("global"),
		IsGlobalOf("global", "local"),
		optional(
			GlobalTransform("parentGlobal"),
			LocalTransform("parentLocal"),
			IsParentOf("parentLocal", "local"),
		)
	)
	.return("local", "global", "parentGlobal");
