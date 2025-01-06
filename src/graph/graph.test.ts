import { beforeEach, describe, it } from "node:test";
import { deepStrictEqual } from "node:assert";
import { Edge, EdgeDirection, Node, oneOf, query, World } from "./graph.ts";
import { assertTypesEqual } from "../utils/type-assertions.ts";

beforeEach(() => {
  Node.defaultWorld = new World();
});

describe("Wildcards", () => {
  it("Find all nodes", () => {
    // Arrange
    class TestNode extends Node {}

    const node1 = new Node();
    const node2 = new TestNode();
    new Edge({ from: node1, to: node2 });
    new Edge({ from: node2, to: node1 });

    type ExpectedArrayType = [Node];
    const expectedArray: ExpectedArrayType[] = [
      [node1],
      [node2],
    ];

    type ExpectedObjectType = { node: Node };
    const expectedObject: ExpectedObjectType[] = (
      expectedArray.map(([node]) => ({ node }))
    );

    // Act
    const arrayGenerator = query([Node]);
    const objectGenerator = query({ node: Node });

    // Assert
    assertTypesEqual<typeof arrayGenerator, Generator<ExpectedArrayType>>(true);
    assertTypesEqual<typeof objectGenerator, Generator<ExpectedObjectType>>(true);

    const actualArray = Array.from(arrayGenerator);
    const actualObject = Array.from(objectGenerator);

    deepStrictEqual(actualArray, expectedArray);
    deepStrictEqual(actualObject, expectedObject);
  });

  it("Find all edges", () => {
    // Arrange
    class TestEdge extends Edge {}

    const node1 = new Node();
    const node2 = new Node();
    const edge1 = new Edge({ from: node1, to: node2 });
    const edge2 = new TestEdge({ from: node2, to: node1 });

    type ExpectedArrayType = [Edge];
    const expectedArray: ExpectedArrayType[] = [
      [edge1],
      [edge2],
    ];

    type ExpectedObjectType = { edge: Edge };
    const expectedObject: ExpectedObjectType[] = (
      expectedArray.map(([edge]) => ({ edge }))
    );

    // Act
    const arrayGenerator = query([Edge]);
    const objectGenerator = query({ edge: Edge });

    // Assert
    assertTypesEqual<typeof arrayGenerator, Generator<ExpectedArrayType>>(true);
    assertTypesEqual<typeof objectGenerator, Generator<ExpectedObjectType>>(true);

    const actualArray = Array.from(arrayGenerator);
    const actualObject = Array.from(objectGenerator);

    deepStrictEqual(actualArray, expectedArray);
    deepStrictEqual(actualObject, expectedObject);
  });

  it("Can give node wildcard a reference name", () => {
    // Arrange
    const node1 = new Node();
    const node2 = new Node();

    type ExpectedArrayType = [Node];
    const expectedArray: ExpectedArrayType[] = [
      [node1],
      [node2],
    ];

    type ExpectedObjectType = { node: Node };
    const expectedObject: ExpectedObjectType[] = (
      expectedArray.map(([node]) => ({ node }))
    );

    // Act
    const arrayGenerator = query([Node.as("n")]);
    const objectGenerator = query({ node: Node.as("n") });

    // Assert
    assertTypesEqual<typeof arrayGenerator, Generator<ExpectedArrayType>>(true);
    assertTypesEqual<typeof objectGenerator, Generator<ExpectedObjectType>>(true);

    const actualArray = Array.from(arrayGenerator);
    const actualObject = Array.from(objectGenerator);

    deepStrictEqual(actualArray, expectedArray);
    deepStrictEqual(actualObject, expectedObject);
  });

  it("Find nodes with any connected nodes ", () => {});
});

describe("References", () => {
  it("Find nodes based on referenced node", () => {});

  it("Find nodes based on referenced edge source", () => {});

  it("Find nodes based on referenced edge target", () => {});

  it("Find nodes with implicit edge to referenced node", () => {});

  it("Find nodes with implicit edge to referenced edge source", () => {});

  it("Find nodes with implicit edge to referenced edge target", () => {});

  it("Find nodes with any edge to referenced node", () => {});

  it("Find nodes with any edge to referenced edge source", () => {});

  it("Find nodes with any edge to referenced edge target", () => {});

  it("Find nodes with specific edge to referenced node", () => {});

  it("Find nodes with specific edge to referenced edge source", () => {});

  it("Find nodes with specific edge to referenced edge target", () => {});


});

describe("Specific nodes", () => {
  it("Find specific type of nodes", () => {
    // Arrange
    class TestNode1 extends Node {
      value: number;

      constructor(value: number) {
        super();

        this.value = value;
      }
    }

    class TestNode2 extends Node {
      value: number;

      constructor(value: number) {
        super();

        this.value = value;
      }
    }

    new Node();
    const node2 = new TestNode1(1);
    const node3 = new TestNode1(2);
    new TestNode2(3);

    type ExpectedArrayType = [TestNode1];
    const expectedArray: ExpectedArrayType[] = [
      [node2],
      [node3],
    ];

    type ExpectedObjectType = { node: TestNode1 };
    const expectedObject: ExpectedObjectType[] = (
      expectedArray.map(([node]) => ({ node }))
    );

    // Act
    const arrayGenerator = query([TestNode1]);
    const objectGenerator = query({ node: TestNode1 });

    // Assert
    assertTypesEqual<typeof arrayGenerator, Generator<ExpectedArrayType>>(true);
    assertTypesEqual<typeof objectGenerator, Generator<ExpectedObjectType>>(true);

    const actualArray = Array.from(arrayGenerator);
    const actualObject = Array.from(objectGenerator);

    deepStrictEqual(actualArray, expectedArray);
    deepStrictEqual(actualObject, expectedObject);
  });

  it("Find nodes with specific type of connected nodes", () => {});
});

describe("Specific edges", () => {
  it("Find nodes with specific type of edges", () => {});
});

describe("Boolean queries", () => {
  it("Find one of specified nodes", () => {});

  it("Find nodes with one of specified edges", () => {});

  it("Find nodes by one of specified reference names", () => {});

  it("Find nodes with one of specified conditions", () => {});

  it("Find nodes with one of specified edge targets", () => {});

  it("Find nodes with one of specified edge targets", () => {});
});

describe("Negative tests", () => {
  it("Find nothing when input is empty", () => {
    // Arrange
    type ExpectedArrayType = [];
    const expectedArray: ExpectedArrayType[] = [];

    type ExpectedObjectType = {};
    const expectedObject: ExpectedObjectType[] = [];

    // Act
    const arrayGenerator = query([]);
    const objectGenerator = query({});

    // Assert
    assertTypesEqual<typeof arrayGenerator, Generator<ExpectedArrayType>>(true);
    assertTypesEqual<typeof objectGenerator, Generator<ExpectedObjectType>>(true);

    const actualArray = Array.from(arrayGenerator);
    const actualObject = Array.from(objectGenerator);

    deepStrictEqual(actualArray, expectedArray);
    deepStrictEqual(actualObject, expectedObject);
  });

  it("Find no nodes when world is empty", () => {
    // Arrange
    type ExpectedArrayType = [Node];
    const expectedArray: ExpectedArrayType[] = [];

    type ExpectedObjectType = { node: Node };
    const expectedObject: ExpectedObjectType[] = [];

    // Act
    const arrayGenerator = query([Node]);
    const objectGenerator = query({ node: Node });

    // Assert
    assertTypesEqual<typeof arrayGenerator, Generator<ExpectedArrayType>>(true);
    assertTypesEqual<typeof objectGenerator, Generator<ExpectedObjectType>>(true);

    const actualArray = Array.from(arrayGenerator);
    const actualObject = Array.from(objectGenerator);

    deepStrictEqual(actualArray, expectedArray);
    deepStrictEqual(actualObject, expectedObject);
  });

  it("Find no edges when nodes are not connected", () => {
    // Arrange
    new Node();
    new Node();

    type ExpectedArrayType = [Edge];
    const expectedArray: ExpectedArrayType[] = [];

    type ExpectedObjectType = { edge: Edge };
    const expectedObject: ExpectedObjectType[] = [];

    // Act
    const arrayGenerator = query([Edge]);
    const objectGenerator = query({ edge: Edge });

    // Assert
    assertTypesEqual<typeof arrayGenerator, Generator<ExpectedArrayType>>(true);
    assertTypesEqual<typeof objectGenerator, Generator<ExpectedObjectType>>(true);

    const actualArray = Array.from(arrayGenerator);
    const actualObject = Array.from(objectGenerator);

    deepStrictEqual(actualArray, expectedArray);
    deepStrictEqual(actualObject, expectedObject);
  });

  it("Can't pass wrong types to query", () => {
    // @ts-expect-error
    query([1]);
    // @ts-expect-error
    query({ x: 1 });
    // @ts-expect-error
    query([""]);
    // @ts-expect-error
    query({ x: "" });
    // @ts-expect-error
    query([{}]);
    // @ts-expect-error
    query({ x: {} });
    // @ts-expect-error
    query([[]]);
    // @ts-expect-error
    query({ x: [] });
    // @ts-expect-error
    query([null]);
    // @ts-expect-error
    query({ x: null });
    // @ts-expect-error
    query([undefined]);
    // @ts-expect-error
    query({ x: undefined });
    // @ts-expect-error
    query([{} as unknown]);
    // @ts-expect-error
    query({ x: {} as unknown });
  });
});

// Finds spaceships docked to planets ruled by an allied faction
describe("Spaceship scenario", () => {
  it("By full list of nodes and edges with references", () => {
    // Arrange
    const {
      instances: { nodes, edges },
      types: {
        nodes: { Spaceship, Planet, Faction },
        edges: { BelongsTo, DockedTo, RuledBy, AlliedWith },
      },
    } = setUpSpaceshipScenario();

    type ExpectedType = [
      Spaceship,
      Planet,
      Faction,
      Faction,
      DockedTo,
      BelongsTo,
      RuledBy,
      (BelongsTo | AlliedWith),
    ];
    const expectedArray: ExpectedType[] = [
      [
        nodes.deathStar,
        nodes.alderran,
        nodes.empire,
        nodes.empire,
        edges.deathStarDockedToAlderran,
        edges.deathStarBelongsToEmpire,
        edges.alderranRuledByEmpire,
        edges.deathStarBelongsToEmpire,
      ],
      [
        nodes.slave1,
        nodes.tatooine,
        nodes.bountyHunters,
        nodes.empire,
        edges.slave1DockedToTatooine,
        edges.slave1BelongsToBountyHunters,
        edges.tatooineRuledByEmpire,
        edges.empireAlliedWithBountyHunters,
      ]
    ];

    // Act
    const generator = query([
      Spaceship.as("ship"),
      Planet.as("planet"),
      Faction.as("ship faction"),
      Faction.as("planet faction"),
      DockedTo.from("ship").to("planet"),
      BelongsTo.from("ship").to("ship faction"),
      RuledBy.from("planet").to("planet faction"),
      oneOf(
        BelongsTo.from("ship").to("planet faction"),
        AlliedWith.from("ship faction").to("planet faction"),
      )
    ]);

    // Assert
    assertTypesEqual<typeof generator, Generator<ExpectedType>>(true);

    const actualArray = Array.from(generator);

    deepStrictEqual(actualArray, expectedArray);
  });

  it("By list of edges with deep query to nodes", () => {
    // Arrange
    const {
      instances: { edges },
      types: {
        nodes: { Spaceship, Planet, Faction },
        edges: { BelongsTo, DockedTo, RuledBy, AlliedWith },
      },
    } = setUpSpaceshipScenario();

    type ExpectedType = [
      BelongsTo,
      RuledBy,
      DockedTo,
      (BelongsTo | AlliedWith),
    ];
    const expectedArray: ExpectedType[] = [
      [
        edges.deathStarBelongsToEmpire,
        edges.alderranRuledByEmpire,
        edges.deathStarDockedToAlderran,
        edges.deathStarBelongsToEmpire,
      ],
      [
        edges.slave1BelongsToBountyHunters,
        edges.tatooineRuledByEmpire,
        edges.slave1DockedToTatooine,
        edges.empireAlliedWithBountyHunters,
      ]
    ];

    // Act
    const generator = query([
      BelongsTo
        .from(Spaceship.as("ship"))
        .to(Faction.as("ship faction")),
      RuledBy
        .from(Planet.as("planet"))
        .to(Faction.as("planet faction")),
      DockedTo.from("ship").to("planet"),
      oneOf(
        BelongsTo.from("ship").to("planet faction"),
        AlliedWith.from("ship faction").to("planet faction"),
      )
    ]);

    // Assert
    assertTypesEqual<typeof generator, Generator<ExpectedType>>(true);

    const actualArray = Array.from(generator);

    deepStrictEqual(actualArray, expectedArray);
  });

  it("By list of edges and edges to implicit nodes", () => {
    // Arrange
    const {
      instances: { edges },
      types: {
        edges: { BelongsTo, DockedTo, RuledBy, AlliedWith },
      },
    } = setUpSpaceshipScenario();

    type ExpectedType = [
      BelongsTo,
      RuledBy,
      DockedTo,
      (BelongsTo | AlliedWith),
    ];
    const expectedArray: ExpectedType[] = [
      [
        edges.deathStarBelongsToEmpire,
        edges.alderranRuledByEmpire,
        edges.deathStarDockedToAlderran,
        edges.deathStarBelongsToEmpire,
      ],
      [
        edges.slave1BelongsToBountyHunters,
        edges.tatooineRuledByEmpire,
        edges.slave1DockedToTatooine,
        edges.empireAlliedWithBountyHunters,
      ]
    ];

    // Act
    const generator = query([
      BelongsTo
        .from("ship")
        .to("ship faction"),
      RuledBy
        .from("planet")
        .to("planet faction"),
      DockedTo.from("ship").to("planet"),
      oneOf(
        BelongsTo.from("ship").to("planet faction"),
        AlliedWith.from("ship faction").to("planet faction"),
      )
    ]);

    // Assert
    assertTypesEqual<typeof generator, Generator<ExpectedType>>(true);

    const actualArray = Array.from(generator);

    deepStrictEqual(actualArray, expectedArray);
  });

  it("By deep query on spaceship node", () => {
    // Arrange
    const {
      instances: { nodes },
      types: {
        nodes: { Spaceship, Planet, Faction },
        edges: { BelongsTo, DockedTo, RuledBy, AlliedWith },
      },
    } = setUpSpaceshipScenario();

    type ExpectedType = [
      Spaceship,
    ];
    const expectedArray: ExpectedType[] = [
      [nodes.deathStar],
      [nodes.slave1],
    ];

    // Act
    const generator = query([
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

    // Assert
    assertTypesEqual<typeof generator, Generator<ExpectedType>>(true);

    const actualArray = Array.from(generator);

    deepStrictEqual(actualArray, expectedArray);
  });

  it("By deep query on spaceship node with implicit nodes", () => {
    // Arrange
    const {
      instances: { nodes },
      types: {
        nodes: { Spaceship, Planet, Faction },
        edges: { BelongsTo, DockedTo, RuledBy, AlliedWith },
      },
    } = setUpSpaceshipScenario();

    type ExpectedType = [
      Spaceship,
    ];
    const expectedArray: ExpectedType[] = [
      [nodes.deathStar],
      [nodes.slave1],
    ];

    // Act
    const generator = query([
      Spaceship.with(
        BelongsTo.to("ship faction"),
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

    // Assert
    assertTypesEqual<typeof generator, Generator<ExpectedType>>(true);

    const actualArray = Array.from(generator);

    deepStrictEqual(actualArray, expectedArray);
  });

  it("By deep query on spaceship node with oneOf in edge target", () => {
    // Arrange
    const {
      instances: { nodes },
      types: {
        nodes: { Spaceship, Planet, Faction },
        edges: { BelongsTo, DockedTo, RuledBy, AlliedWith },
      },
    } = setUpSpaceshipScenario();

    type ExpectedType = [
      Spaceship
    ];
    const expectedArray: ExpectedType[] = [
      [nodes.deathStar],
      [nodes.slave1],
    ];

    // Act
    const generator = query([
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

    // Assert
    assertTypesEqual<typeof generator, Generator<ExpectedType>>(true);

    const actualArray = Array.from(generator);

    deepStrictEqual(actualArray, expectedArray);
  });

  it("By list of nodes with deep query to edges", () => {
    // Arrange
    const {
      instances: { nodes },
      types: {
        nodes: { Spaceship, Planet, Faction },
        edges: { BelongsTo, DockedTo, RuledBy, AlliedWith },
      },
    } = setUpSpaceshipScenario();

    type ExpectedType = [
      Spaceship,
      Planet,
      Faction,
    ];
    const expectedArray: ExpectedType[] = [
      [nodes.deathStar, nodes.alderran, nodes.empire],
      [nodes.slave1, nodes.tatooine, nodes.empire],
    ];

    // Act
    const generator: Generator<ExpectedType> = query([
      Spaceship.with(
        BelongsTo.to("ship faction"),
        DockedTo.to("planet"),
      ),
      Planet.with(
        RuledBy.to(oneOf(
          "ship faction",
          "planet faction"
        )),
      ),
      oneOf(
        Faction.as("ship faction"),
        Faction.as("planet faction").with(
          AlliedWith.from("ship faction"),
        )
      ),
    ]);

    // Assert
    assertTypesEqual<typeof generator, Generator<ExpectedType>>(true);

    const actualArray = Array.from(generator);

    deepStrictEqual(actualArray, expectedArray);
  });
})

function setUpSpaceshipScenario() {
  // I never watched Star Wars, don't @ me

  const empire = new Faction({ name: "Empire" });
  const rebellion = new Faction({ name: "Rebellion" });
  const bountyHunters = new Faction({ name: "Bounty Hunters" });

  const deathStar = new Spaceship({ name: "Death Star" });
  const millenniumFalcon = new Spaceship({ name: "Millennium Falcon" });
  const tieFighter = new Spaceship({ name: "Tie Fighter" });
  const slave1 = new Spaceship({ name: "Slave 1" });

  const alderran = new Planet({ name: "Alderran" });
  const tatooine = new Planet({ name: "Tatooine" });
  const endor = new Planet({ name: "Endor" });

  const deathStarBelongsToEmpire = (
    new BelongsTo({ from: deathStar, to: empire })
  );
  const tieFighterBelongsToEmpire = (
    new BelongsTo({ from: tieFighter, to: empire })
  );
  const millenniumFalconBelongsToRebellion = (
    new BelongsTo({ from: millenniumFalcon, to: rebellion })
  );
  const slave1BelongsToBountyHunters = (
    new BelongsTo({ from: slave1, to: bountyHunters })
  );

  const alderranRuledByEmpire = (
    new RuledBy({ from: alderran, to: empire })
  );
  const tatooineRuledByEmpire = (
    new RuledBy({ from: tatooine, to: empire })
  );
  const endorRuledByRebellion = (
    new RuledBy({ from: endor, to: rebellion })
  );

  const deathStarDockedToAlderran = (
    new DockedTo({ from: deathStar, to: alderran })
  );
  const millenniumFalconDockedToTatooine = (
    new DockedTo({ from: millenniumFalcon, to: tatooine })
  );
  const tieFighterDockedToEndor = (
    new DockedTo({ from: tieFighter, to: endor })
  );
  const slave1DockedToTatooine = (
    new DockedTo({ from: slave1, to: tatooine })
  );

  const empireAlliedWithBountyHunters = (
    new AlliedWith({ from: empire, to: bountyHunters })
  );

  return {
    instances: {
      nodes: {
        empire,
        rebellion,
        bountyHunters,
        deathStar,
        millenniumFalcon,
        tieFighter,
        slave1,
        alderran,
        tatooine,
        endor,
      },
      edges: {
        deathStarBelongsToEmpire,
        tieFighterBelongsToEmpire,
        millenniumFalconBelongsToRebellion,
        slave1BelongsToBountyHunters,
        alderranRuledByEmpire,
        tatooineRuledByEmpire,
        endorRuledByRebellion,
        deathStarDockedToAlderran,
        millenniumFalconDockedToTatooine,
        tieFighterDockedToEndor,
        slave1DockedToTatooine,
        empireAlliedWithBountyHunters,
      },
    },
    types: {
      nodes: { Spaceship, Planet, Faction },
      edges: { BelongsTo, DockedTo, RuledBy, AlliedWith },
    }
  }
}

class Spaceship extends Node {}

class Planet extends Node {}

class Faction extends Node {}

class BelongsTo extends Edge {
  static direction = EdgeDirection.OneWay;
}

class DockedTo extends Edge {
  static direction = EdgeDirection.OneWay;
}

class RuledBy extends Edge {
  static direction = EdgeDirection.OneWay;
}

class AlliedWith extends Edge {}