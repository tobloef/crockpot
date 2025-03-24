import {
  afterEach,
  describe,
  it,
  mock,
} from "node:test";
import { strictEqual } from "node:assert";

describe("GraphQuery", () => {
  // Defined globally to work around module mocking influencing between tests
  const mockedRunQueryBySlots = mock.fn(function* () {});

  afterEach(() => {
    mockedRunQueryBySlots.mock.resetCalls();
  });

  it("Uncached queries are run every time", async (test) => {
    // Arrange
    test.mock.module("./run-query.ts", {
      namedExports: {
        runQueryBySlots: mockedRunQueryBySlots,
        runQuery: mock.fn(),
      }
    });

    const { Graph, Node, GraphQuery} = await import("../index.ts");

    const graphQuery = new GraphQuery(
      new Graph(),
      Node,
      { cache: false },
    );

    // Act
    [...graphQuery.run()];
    [...graphQuery.run()];

    // Assert
    strictEqual(mockedRunQueryBySlots.mock.calls.length, 2);
  });


  it("Cached queries are once", async (test) => {
    // Arrange
    test.mock.module("./run-query.ts", {
      namedExports: {
        runQueryBySlots: mockedRunQueryBySlots,
        runQuery: mock.fn(),
      }
    });

    const { Graph, Node, GraphQuery} = await import("../index.ts");

    const graphQuery = new GraphQuery(
      new Graph(),
      Node,
      { cache: true },
    );

    // Act
    [...graphQuery.run()];
    [...graphQuery.run()];

    // Assert
    strictEqual(mockedRunQueryBySlots.mock.calls.length, 1);
  });

  it("Adding a node will re-trigger the cached query", async (test) => {
    // Arrange
    test.mock.module("./run-query.ts", {
      namedExports: {
        runQueryBySlots: mockedRunQueryBySlots,
        runQuery: mock.fn(),
      }
    });

    const { Graph, Node, GraphQuery} = await import("../index.ts");

    const graph = new Graph();
    const graphQuery = new GraphQuery(
      graph,
      Node,
      { cache: true },
    );

    // Act
    [...graphQuery.run()];
    graph.addNode(new Node());
    [...graphQuery.run()];

    // Assert
    strictEqual(mockedRunQueryBySlots.mock.calls.length, 2);
  });

  it("Removing a node will re-trigger the cached query", async (test) => {
    // Arrange
    test.mock.module("./run-query.ts", {
      namedExports: {
        runQueryBySlots: mockedRunQueryBySlots,
        runQuery: mock.fn(),
      }
    });

    const { Graph, Node, GraphQuery} = await import("../index.ts");

    const graph = new Graph();

    const node = new Node();
    graph.addNode(node);

    const graphQuery = new GraphQuery(
      graph,
      Node,
      { cache: true },
    );

    // Act
    [...graphQuery.run()];
    graph.removeNode(node);
    [...graphQuery.run()];

    // Assert
    strictEqual(mockedRunQueryBySlots.mock.calls.length, 2);
  });
});
