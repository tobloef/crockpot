import { describe, it } from "node:test";
import { deepStrictEqual } from "node:assert";
import { Graph } from "../graph.ts";
import { Node } from "../node/node.ts";
import { Edge } from "../edge/edge.ts";
import { typesEqual } from "../utils/type-assertion.ts";

class NodeA extends Node {}

class NodeB extends Node {
  value: number;
  constructor(value: number) {
    super();
    this.value = value;
  }
}

class ChildOfNodeA extends NodeA {}

class EdgeA extends Edge {}

class EdgeB extends Edge {
  value: number;
  constructor(value: number) {
    super();
    this.value = value;
  }
}

class ChildOfEdgeA extends EdgeA {}

describe("query", () => {
  it("Finds nothing when querying for node not in graph", () => {
    // Arrange
    const graph = new Graph();
    graph.addNode(new Node());
    graph.addNode(new NodeA());

    // Act
    const singleResult = graph.query(NodeB).toArray();
    const arrayResult = graph.query([ NodeB ]).toArray();
    const objectResult = graph.query({ NodeB }).toArray();

    // Assert
    typesEqual<typeof singleResult, NodeB[]>(true);
    typesEqual<typeof arrayResult, [ NodeB ][]>(true);
    typesEqual<typeof objectResult, { NodeB: NodeB }[]>(true);

    deepStrictEqual(singleResult, []);
    deepStrictEqual(arrayResult, []);
    deepStrictEqual(objectResult, []);
  });

  it("Finds node when querying for node in graph", () => {
    // Arrange
    const graph = new Graph();
    const node = graph.addNode(new NodeB(1));

    // Act
    const singleResult = graph.query(NodeB).toArray();
    const arrayResult = graph.query([ NodeB ]).toArray();
    const objectResult = graph.query({ NodeB }).toArray();

    // Assert
    typesEqual<typeof singleResult, NodeB[]>(true);
    typesEqual<typeof arrayResult, [ NodeB ][]>(true);
    typesEqual<typeof objectResult, { NodeB: NodeB }[]>(true);

    deepStrictEqual(singleResult, [ node ]);
    deepStrictEqual(arrayResult, [[ node ]]);
    deepStrictEqual(objectResult, [{ NodeB: node }]);
  });

  it("Finds all nodes when querying for Node class", () => {
    // Arrange
    const graph = new Graph();
    const node = graph.addNode(new Node());
    const nodeA = graph.addNode(new NodeA());
    const nodeB = graph.addNode(new NodeB(1));

    // Act
    const singleResult = graph.query(Node).toArray();
    const arrayResult = graph.query([ Node ]).toArray();
    const objectResult = graph.query({ Node }).toArray();

    // Assert
    typesEqual<typeof singleResult, Node[]>(true);
    typesEqual<typeof arrayResult, [ Node ][]>(true);
    typesEqual<typeof objectResult, { Node: Node }[]>(true);

    deepStrictEqual(singleResult, [ node, nodeA, nodeB ]);
    deepStrictEqual(arrayResult, [ [ node ], [ nodeA ], [ nodeB ] ]);
    deepStrictEqual(objectResult, [ { Node: node }, { Node: nodeA }, { Node: nodeB } ]);
  });

  it("Finds nodes of child class when querying for nodes of parent class", () => {
    // Arrange
    const graph = new Graph();
    const nodeA = graph.addNode(new NodeA());
    const childOfNodeA = graph.addNode(new ChildOfNodeA());

    // Act
    const singleResult = graph.query(NodeA).toArray();
    const arrayResult = graph.query([ NodeA ]).toArray();
    const objectResult = graph.query({ NodeA }).toArray();

    // Assert
    typesEqual<typeof singleResult, NodeA[]>(true);
    typesEqual<typeof arrayResult, [ NodeA ][]>(true);
    typesEqual<typeof objectResult, { NodeA: NodeA }[]>(true);

    deepStrictEqual(singleResult, [ nodeA, childOfNodeA ]);
    deepStrictEqual(arrayResult, [ [ nodeA ], [ childOfNodeA ] ]);
    deepStrictEqual(objectResult, [ { NodeA: nodeA }, { NodeA: childOfNodeA } ]);
  });

  it("Does not find nodes of parent class when querying for nodes of child class", () => {
    // Arrange
    const graph = new Graph();
    const nodeA = graph.addNode(new NodeA());
    const childOfNodeA = graph.addNode(new ChildOfNodeA());

    // Act
    const singleResult = graph.query(ChildOfNodeA).toArray();
    const arrayResult = graph.query([ ChildOfNodeA ]).toArray();
    const objectResult = graph.query({ ChildOfNodeA }).toArray();

    // Assert
    typesEqual<typeof singleResult, ChildOfNodeA[]>(true);
    typesEqual<typeof arrayResult, [ ChildOfNodeA ][]>(true);
    typesEqual<typeof objectResult, { ChildOfNodeA: ChildOfNodeA }[]>(true);

    deepStrictEqual(singleResult, [ childOfNodeA ]);
    deepStrictEqual(arrayResult, [ [ childOfNodeA ] ]);
    deepStrictEqual(objectResult, [ { ChildOfNodeA: childOfNodeA } ]);
  });

  it("Finds multiple different node types in one input", () => {
    // Arrange
    const graph = new Graph();
    const node = graph.addNode(new Node());
    const nodeA = graph.addNode(new NodeA());
    const nodeB = graph.addNode(new NodeB(1));

    // Act
    const arrayResult = graph.query([ NodeA, NodeB ]).toArray();
    const objectResult = graph.query({ NodeA, NodeB }).toArray();

    // Assert
    typesEqual<typeof arrayResult, [ NodeA, NodeB ][]>(true);
    typesEqual<typeof objectResult, { NodeA: NodeA, NodeB: NodeB }[]>(true);

    deepStrictEqual(arrayResult, [ [ nodeA, nodeB ] ]);
    deepStrictEqual(objectResult, [ { NodeA: nodeA, NodeB: nodeB } ]);
  });

  it("Finds nothing when querying for edge of type not in graph", () => {
    // Arrange
    const graph = new Graph();
    const nodeA = graph.addNode(new NodeA());
    const nodeB = graph.addNode(new NodeB(1));
    const edgeA = graph.addEdge({
      from: nodeA,
      to: nodeB,
      edge: new EdgeA(),
    });
    const edge = graph.addEdge({
      from: nodeA,
      to: nodeB,
    });

    // Act
    const singleResult = graph.query(EdgeB).toArray();
    const arrayResult = graph.query([ EdgeB ]).toArray();
    const objectResult = graph.query({ EdgeB }).toArray();

    // Assert
    typesEqual<typeof singleResult, EdgeB[]>(true);
    typesEqual<typeof arrayResult, [ EdgeB ][]>(true);
    typesEqual<typeof objectResult, { EdgeB: EdgeB }[]>(true);

    deepStrictEqual(singleResult, []);
    deepStrictEqual(arrayResult, []);
    deepStrictEqual(objectResult, []);
  });

  it("Finds edge when querying for edge of type in graph", () => {
    // Arrange
    const graph = new Graph();
    const nodeA = graph.addNode(new NodeA());
    const nodeB = graph.addNode(new NodeB(1));
    const edgeB = graph.addEdge({
      from: nodeA,
      to: nodeB,
      edge: new EdgeB(1),
    });
    const edge = graph.addEdge({
      from: nodeA,
      to: nodeB,
    });

    // Act
    const singleResult = graph.query(EdgeB).toArray();
    const arrayResult = graph.query([ EdgeB ]).toArray();
    const objectResult = graph.query({ EdgeB }).toArray();

    // Assert
    typesEqual<typeof singleResult, EdgeB[]>(true);
    typesEqual<typeof arrayResult, [ EdgeB ][]>(true);
    typesEqual<typeof objectResult, { EdgeB: EdgeB }[]>(true);

    deepStrictEqual(singleResult, [ edgeB ]);
    deepStrictEqual(arrayResult, [[ edgeB ]]);
    deepStrictEqual(objectResult, [{ EdgeB: edgeB }]);
  });

  it("Finds all edges when querying for Edge class", () => {
    // Arrange
    const graph = new Graph();
    const nodeA = graph.addNode(new NodeA());
    const nodeB = graph.addNode(new NodeB(1));
    const edgeA = graph.addEdge({
      from: nodeA,
      to: nodeB,
      edge: new EdgeA(),
    });
    const edgeB = graph.addEdge({
      from: nodeA,
      to: nodeB,
      edge: new EdgeB(1),
    });
    const edge = graph.addEdge({
      from: nodeA,
      to: nodeB,
    });

    // Act
    const singleResult = graph.query(Edge).toArray();
    const arrayResult = graph.query([ Edge ]).toArray();
    const objectResult = graph.query({ Edge }).toArray();

    // Assert
    typesEqual<typeof singleResult, Edge[]>(true);
    typesEqual<typeof arrayResult, [ Edge ][]>(true);
    typesEqual<typeof objectResult, { Edge: Edge }[]>(true);

    deepStrictEqual(singleResult, [ edgeA, edgeB, edge ]);
    deepStrictEqual(arrayResult, [ [ edgeA ], [ edgeB ], [ edge ] ]);
    deepStrictEqual(objectResult, [ { Edge: edgeA }, { Edge: edgeB }, { Edge: edge } ]);
  });

  it("Finds edges of child class when querying for edges of parent class", () => {
    // Arrange
    const graph = new Graph();
    const nodeA = graph.addNode(new NodeA());
    const nodeB = graph.addNode(new NodeB(1));
    const childOfEdgeA = graph.addEdge({
      from: nodeA,
      to: nodeB,
      edge: new ChildOfEdgeA(),
    });

    // Act
    const singleResult = graph.query(EdgeA).toArray();
    const arrayResult = graph.query([ EdgeA ]).toArray();
    const objectResult = graph.query({ EdgeA }).toArray();

    // Assert
    typesEqual<typeof singleResult, EdgeA[]>(true);
    typesEqual<typeof arrayResult, [ EdgeA ][]>(true);
    typesEqual<typeof objectResult, { EdgeA: EdgeA }[]>(true);

    deepStrictEqual(singleResult, [ childOfEdgeA ]);
    deepStrictEqual(arrayResult, [ [ childOfEdgeA ] ]);
    deepStrictEqual(objectResult, [ { EdgeA: childOfEdgeA } ]);
  });

  it("Does not find edges of parent class when querying for edges of child class", () => {
    // Arrange
    const graph = new Graph();
    const nodeA = graph.addNode(new NodeA());
    const nodeB = graph.addNode(new NodeB(1));
    const childOfEdgeA = graph.addEdge({
      from: nodeA,
      to: nodeB,
      edge: new ChildOfEdgeA(),
    });

    // Act
    const singleResult = graph.query(ChildOfEdgeA).toArray();
    const arrayResult = graph.query([ ChildOfEdgeA ]).toArray();
    const objectResult = graph.query({ ChildOfEdgeA }).toArray();

    // Assert
    typesEqual<typeof singleResult, ChildOfEdgeA[]>(true);
    typesEqual<typeof arrayResult, [ ChildOfEdgeA ][]>(true);
    typesEqual<typeof objectResult, { ChildOfEdgeA: ChildOfEdgeA }[]>(true);

    deepStrictEqual(singleResult, [ childOfEdgeA ]);
    deepStrictEqual(arrayResult, [ [ childOfEdgeA ] ]);
    deepStrictEqual(objectResult, [ { ChildOfEdgeA: childOfEdgeA } ]);
  });

  it("Finds multiple different edge types in one input", () => {
    // Arrange
    const graph = new Graph();
    const nodeA = graph.addNode(new NodeA());
    const nodeB = graph.addNode(new NodeB(1));
    const edgeA = graph.addEdge({
      from: nodeA,
      to: nodeB,
      edge: new EdgeA(),
    });
    const edgeB = graph.addEdge({
      from: nodeA,
      to: nodeB,
      edge: new EdgeB(1),
    });
    const edge = graph.addEdge({
      from: nodeA,
      to: nodeB,
    });

    // Act
    const arrayResult = graph.query([ EdgeA, EdgeB ]).toArray();
    const objectResult = graph.query({ EdgeA, EdgeB }).toArray();

    // Assert
    typesEqual<typeof arrayResult, [ EdgeA, EdgeB ][]>(true);
    typesEqual<typeof objectResult, { EdgeA: EdgeA, EdgeB: EdgeB }[]>(true);

    deepStrictEqual(arrayResult, [ [ edgeA, edgeB ] ]);
    deepStrictEqual(objectResult, [ { EdgeA: edgeA, EdgeB: edgeB } ]);
  });
});

describe("TODO", () => {
  it("Does not find the same output twice", () => {});
})