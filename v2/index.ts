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
