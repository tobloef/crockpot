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

////////////////////////////////////////////////////////////////////////////////

graph
	.query(
		Node.as("n"),
		Position.as("pos"),
		Velocity.as("vel"),
		Edge.from("n").to("pos"),
		Edge.from("n").to("vel"),
	)
	.return("pos", "vel");

graph
	.query(
		Spaceship.as("ship"),
		Planet.as("planet"),
		Faction.as("ship owners"),
		Faction.as("planet rulers"),
		OwnedBy.from("ship").to("ship owners"),
		RuledBy.from("planet").to("planet rulers"),
		Allied.from("planet ruler").to("ship owners"),
	)
	.return("ship");

graph
	.query(
		LocalTransform.as("local"),
		GlobalTransform.as("global"),
		IsGlobalOf.from("global").to("local"),
		optional(
			GlobalTransform.as("parentGlobal"),
			LocalTransform.as("parentLocal"),
			IsParentOf.from("parentLocal").to("local"),
		)
	)
	.return("local", "global", "parentGlobal");

////////////////////////////////////////////////////////////////////////////////

graph.query(
  Node.as("n"),
  Position.as("pos"),
  Velocity.as("vel"),
  Edge.between("n", "pos"),
  Edge.between("n", "vel"),
);

graph.query(
  Spaceship.as("ship"),
  Planet.as("planet"),
  Faction.as("ship owners"),
  Faction.as("planet rulers"),
  OwnedBy.between("ship", "ship owners"),
  RuledBy.between("planet", "planet rulers"),
  Allied.between("planet ruler", "ship owners"),
);

graph.query(
  LocalTransform.as("local"),
  GlobalTransform.as("global"),
  IsGlobalOf.between("global", "local"),
  optional(
    GlobalTransform.as("parentGlobal"),
    LocalTransform.as("parentLocal"),
    IsParentOf.between("parentLocal", "local"),
  )
);

////////////////////////////////////////////////////////////////////////////////

graph.query({
	n: Node,
	pos: Position,
	vel: Velocity,
	e1: Edge.between("n", "pos"),
	e2: Edge.between("n", "vel"),
});

graph.query({
	ship: Spaceship,
	planet: Planet,
	shipOwners: Faction,
	planetRulers: Faction,
	ownedBy: OwnedBy.between("ship", "ship owners"),
	ruledBy: RuledBy.between("planet", "planetRulers"),
	allied: Allied.between("planetRulers", "shipOwners"),
});

graph.query({
	local: LocalTransform,
	global: GlobalTransform,
	isGlobalOf: IsGlobalOf.between("global", "local"),
	parent: optional({
		global: GlobalTransform,
		local: LocalTransform,
		isParentOf: IsParentOf.between("parentLocal", "local"),
	})
});

////////////////////////////////////////////////////////////////////////////////

graph.query({
	n: Node,
	pos: Position,
	vel: Velocity,
	e1: ["n", Edge, "pos"],
	e2: ["n", Edge, "vel"],
});

graph.query({
	ship: Spaceship,
	planet: Planet,
	shipOwners: Faction,
	planetRulers: Faction,
	ownedBy: ["ship", OwnedBy, "ship owners"],
	ruledBy: ["planet", RuledBy, "planetRulers"],
	allied: ["planetRulers", Allied, "shipOwners"],
});

graph.query({
	local: LocalTransform,
	global: GlobalTransform,
	isGlobalOf: ["global", IsGlobalOf, "local"],
	parent: optional({
		global: GlobalTransform,
		local: LocalTransform,
		isParentOf: ["parentLocal", IsParentOf, "local"],
	})
});