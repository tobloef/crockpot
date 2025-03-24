import { describe, it } from "node:test";
import { deepStrictEqual, throws } from "node:assert";
import { Graph } from "../graph.ts";
import { Node } from "../node/node.ts";
import { Edge } from "../edge/edge.ts";
import { typesEqual } from "../utils/type-assertion.ts";
import { ReferenceMismatchError } from "./errors/reference-mismatch-error.ts";
import { runQuery } from "./run-query.ts";

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

describe("runQuery", () => {
  it("Finds nothing when querying for node not in graph", () => {
    // Arrange
    const graph = new Graph();
    graph.addNode(new Node());
    graph.addNode(new NodeA());

    // Act
    const singleResult = runQuery(graph, NodeB).toArray();
    const arrayResult = runQuery(graph, [ NodeB ]).toArray();
    const objectResult = runQuery(graph, { NodeB }).toArray();

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
    const singleResult = runQuery(graph, NodeB).toArray();
    const arrayResult = runQuery(graph, [ NodeB ]).toArray();
    const objectResult = runQuery(graph, { NodeB }).toArray();

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
    const singleResult = runQuery(graph, Node).toArray();
    const arrayResult = runQuery(graph, [ Node ]).toArray();
    const objectResult = runQuery(graph, { Node }).toArray();

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
    const singleResult = runQuery(graph, NodeA).toArray();
    const arrayResult = runQuery(graph, [ NodeA ]).toArray();
    const objectResult = runQuery(graph, { NodeA }).toArray();

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
    const singleResult = runQuery(graph, ChildOfNodeA).toArray();
    const arrayResult = runQuery(graph, [ ChildOfNodeA ]).toArray();
    const objectResult = runQuery(graph, { ChildOfNodeA }).toArray();

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
    const arrayResult = runQuery(graph, [ NodeA, NodeB ]).toArray();
    const objectResult = runQuery(graph, { NodeA, NodeB }).toArray();

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
    const singleResult = runQuery(graph, EdgeB).toArray();
    const arrayResult = runQuery(graph, [ EdgeB ]).toArray();
    const objectResult = runQuery(graph, { EdgeB }).toArray();

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
    const singleResult = runQuery(graph, EdgeB).toArray();
    const arrayResult = runQuery(graph, [ EdgeB ]).toArray();
    const objectResult = runQuery(graph, { EdgeB }).toArray();

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
    const singleResult = runQuery(graph, Edge).toArray();
    const arrayResult = runQuery(graph, [ Edge ]).toArray();
    const objectResult = runQuery(graph, { Edge }).toArray();

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
    const singleResult = runQuery(graph, EdgeA).toArray();
    const arrayResult = runQuery(graph, [ EdgeA ]).toArray();
    const objectResult = runQuery(graph, { EdgeA }).toArray();

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
    const singleResult = runQuery(graph, ChildOfEdgeA).toArray();
    const arrayResult = runQuery(graph, [ ChildOfEdgeA ]).toArray();
    const objectResult = runQuery(graph, { ChildOfEdgeA }).toArray();

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
    const arrayResult = runQuery(graph, [ EdgeA, EdgeB ]).toArray();
    const objectResult = runQuery(graph, { EdgeA, EdgeB }).toArray();

    // Assert
    typesEqual<typeof arrayResult, [ EdgeA, EdgeB ][]>(true);
    typesEqual<typeof objectResult, { EdgeA: EdgeA, EdgeB: EdgeB }[]>(true);

    deepStrictEqual(arrayResult, [ [ edgeA, edgeB ] ]);
    deepStrictEqual(objectResult, [ { EdgeA: edgeA, EdgeB: edgeB } ]);
  });

  it("Finds both nodes and edges in one query", () => {
    // Arrange
    const graph = new Graph();
    const nodeA = graph.addNode(new NodeA());
    const nodeB = graph.addNode(new NodeB(1));
    const edgeA = graph.addEdge({
      from: nodeA,
      to: nodeB,
      edge: new EdgeA(),
    });

    // Act
    const arrayResult = runQuery(graph, [ NodeA, EdgeA ]).toArray();
    const objectResult = runQuery(graph, { NodeA, EdgeA }).toArray();

    // Assert
    typesEqual<typeof arrayResult, [ NodeA, EdgeA ][]>(true);
    typesEqual<typeof objectResult, { NodeA: NodeA, EdgeA: EdgeA }[]>(true);

    deepStrictEqual(arrayResult, [ [ nodeA, edgeA ] ]);
    deepStrictEqual(objectResult, [ { NodeA: nodeA, EdgeA: edgeA } ]);
  });

  it("Finds nodes with any edge", () => {
    // Arrange
    const graph = new Graph();
    const node1 = graph.addNode(new NodeA());
    const node2 = graph.addNode(new NodeB(1));
    const node3 = graph.addNode(new NodeA());
    const node4 = graph.addNode(new NodeA());
    graph.addEdge({
      from: node1,
      to: node2,
      edge: new EdgeA(),
    });
    graph.addEdge({
      from: node1,
      to: node2,
    });
    graph.addEdge({
      from: node2,
      to: node3,
    });


    // Act
    const singleResult = runQuery(graph, Node.with(Edge)).toArray();
    const arrayResult = runQuery(graph, [ Node.with(Edge) ]).toArray();
    const objectResult = runQuery(graph, { Node: Node.with(Edge) }).toArray();

    // Assert
    typesEqual<typeof singleResult, Node[]>(true);
    typesEqual<typeof arrayResult, [ Node ][]>(true);
    typesEqual<typeof objectResult, { Node: Node }[]>(true);

    deepStrictEqual(singleResult, [ node1, node2, node3 ]);
    deepStrictEqual(arrayResult, [ [ node1 ], [ node2 ], [ node3 ] ]);
    deepStrictEqual(objectResult, [ { Node: node1 }, { Node: node2 }, { Node: node3 } ]);
  });

  it("Does not find duplicate outputs", () => {
    // Arrange
    const graph = new Graph();
    const nodeA = graph.addNode(new NodeA());
    const nodeB = graph.addNode(new NodeB(1));
    const edge1 = graph.addEdge({ from: nodeA, to: nodeB });
    const edge2 = graph.addEdge({ from: nodeA, to: nodeB });

    // Act
    /**
     * If duplicate outputs were not filtered, this would be expected to return
     * nodeA two times, one for each edge.
     */
    const singleResult = runQuery(graph, Node.with(Edge.to(Node))).toArray();
    const arrayResult = runQuery(graph, [ Node.with(Edge.to(Node)) ]).toArray();
    const objectResult = runQuery(graph, { Node: Node.with(Edge.to(Node)) }).toArray();

    // Assert
    typesEqual<typeof singleResult, Node[]>(true);
    typesEqual<typeof arrayResult, [ Node ][]>(true);
    typesEqual<typeof objectResult, { Node: Node }[]>(true);

    deepStrictEqual(singleResult, [ nodeA ]);
    deepStrictEqual(arrayResult, [ [ nodeA ] ]);
    deepStrictEqual(objectResult, [ { Node: nodeA } ]);
  });

  it("Finds nodes with specific edge type", () => {
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
      from: nodeB,
      to: nodeA,
      edge: new EdgeB(1),
    });

    // Act
    const singleResult = runQuery(graph, Node.with(EdgeA.to(Node))).toArray();
    const arrayResult = runQuery(graph, [ Node.with(EdgeA.to(Node)) ]).toArray();
    const objectResult = runQuery(graph, { Node: Node.with(EdgeA.to(Node)) }).toArray();

    // Assert
    typesEqual<typeof singleResult, Node[]>(true);
    typesEqual<typeof arrayResult, [ Node ][]>(true);
    typesEqual<typeof objectResult, { Node: Node }[]>(true);

    deepStrictEqual(singleResult, [ nodeA ]);
    deepStrictEqual(arrayResult, [ [ nodeA ] ]);
    deepStrictEqual(objectResult, [ { Node: nodeA } ]);
  });

  it("Finds nodes with reference to self when looking for any nodes with edges", () => {
    // Arrange
    const graph = new Graph();
    const nodeA = graph.addNode(new NodeA());
    const nodeB = graph.addNode(new NodeB(1));
    const edgeA = graph.addEdge({
      from: nodeA,
      to: nodeA,
    });

    // Act
    const singleResult = runQuery(graph, Node.with(Edge.to(Node))).toArray();
    const arrayResult = runQuery(graph, [ Node.with(Edge.to(Node)) ]).toArray();
    const objectResult = runQuery(graph, { Node: Node.with(Edge.to(Node)) }).toArray();

    // Assert
    typesEqual<typeof singleResult, Node[]>(true);
    typesEqual<typeof arrayResult, [ Node ][]>(true);
    typesEqual<typeof objectResult, { Node: Node }[]>(true);

    deepStrictEqual(singleResult, [ nodeA ]);
    deepStrictEqual(arrayResult, [ [ nodeA ] ]);
    deepStrictEqual(objectResult, [ { Node: nodeA } ]);
  });

  it("Finds nodes with edges going to them", () => {
    // Arrange
    const graph = new Graph();
    const nodeA = graph.addNode(new NodeA());
    const nodeB = graph.addNode(new NodeB(1));
    const edgeA = graph.addEdge({
      from: nodeA,
      to: nodeB,
    });

    // Act
    const singleResult = runQuery(graph, Node.with(Edge.from(Node))).toArray();
    const arrayResult = runQuery(graph, [ Node.with(Edge.from(Node)) ]).toArray();
    const objectResult = runQuery(graph, { Node: Node.with(Edge.from(Node)) }).toArray();

    // Assert
    typesEqual<typeof singleResult, Node[]>(true);
    typesEqual<typeof arrayResult, [ Node ][]>(true);
    typesEqual<typeof objectResult, { Node: Node }[]>(true);

    deepStrictEqual(singleResult, [ nodeB ]);
    deepStrictEqual(arrayResult, [ [ nodeB ] ]);
    deepStrictEqual(objectResult, [ { Node: nodeB } ]);
  });

  it("Finds nodes with edges going from them", () => {
    // Arrange
    const graph = new Graph();
    const nodeA = graph.addNode(new NodeA());
    const nodeB = graph.addNode(new NodeB(1));
    const edgeA = graph.addEdge({
      from: nodeA,
      to: nodeB,
    });

    // Act
    const singleResult = runQuery(graph, Node.with(Edge.to(Node))).toArray();
    const arrayResult = runQuery(graph, [ Node.with(Edge.to(Node)) ]).toArray();
    const objectResult = runQuery(graph, { Node: Node.with(Edge.to(Node)) }).toArray();

    // Assert
    typesEqual<typeof singleResult, Node[]>(true);
    typesEqual<typeof arrayResult, [ Node ][]>(true);
    typesEqual<typeof objectResult, { Node: Node }[]>(true);

    deepStrictEqual(singleResult, [ nodeA ]);
    deepStrictEqual(arrayResult, [ [ nodeA ] ]);
    deepStrictEqual(objectResult, [ { Node: nodeA } ]);
  });

  it("Finds nodes with edges going either to or from them", () => {
    // Arrange
    const graph = new Graph();
    const nodeA = graph.addNode(new NodeA());
    const nodeB = graph.addNode(new NodeB(1));
    const edgeA = graph.addEdge({
      from: nodeA,
      to: nodeB,
    });

    // Act
    const arrayResult = runQuery(graph, [
      Node.with(Edge.fromOrTo(Node.as("other"))),
      "other",
    ]).toArray();

    const objectResult = runQuery(graph, {
      Node: Node.with(Edge.fromOrTo(Node.as("other"))),
      other: "other",
    } as const).toArray();

    // Assert
    typesEqual<typeof arrayResult, [ Node, Node ][]>(true);
    typesEqual<typeof objectResult, { Node: Node, other: Node }[]>(true);

    deepStrictEqual(arrayResult, [ [ nodeB, nodeA ], [ nodeA, nodeB ] ]);
    deepStrictEqual(objectResult, [ { Node: nodeB, other: nodeA }, { Node: nodeA, other: nodeB } ]);
  });

  it("Finds nodes with implicit edge to them", () => {
    // Arrange
    const graph = new Graph();
    const nodeA = graph.addNode(new NodeA());
    const nodeB = graph.addNode(new NodeB(1));
    graph.addEdge({
      from: nodeA,
      to: nodeB,
    });

    // Act
    const singleResult = runQuery(graph, Node.to(Node)).toArray();
    const arrayResult = runQuery(graph, [ Node.to(Node) ]).toArray();
    const objectResult = runQuery(graph, { Node: Node.to(Node) }).toArray();

    // Assert
    typesEqual<typeof singleResult, Node[]>(true);
    typesEqual<typeof arrayResult, [ Node ][]>(true);
    typesEqual<typeof objectResult, { Node: Node }[]>(true);

    deepStrictEqual(singleResult, [ nodeA ]);
    deepStrictEqual(arrayResult, [ [ nodeA ] ]);
    deepStrictEqual(objectResult, [ { Node: nodeA } ]);
  });

  it("Finds nodes with implicit edge from them", () => {
    // Arrange
    const graph = new Graph();
    const nodeA = graph.addNode(new NodeA());
    const nodeB = graph.addNode(new NodeB(1));
    graph.addEdge({
      from: nodeA,
      to: nodeB,
    });

    // Act
    const singleResult = runQuery(graph, Node.from(Node)).toArray();
    const arrayResult = runQuery(graph, [ Node.from(Node) ]).toArray();
    const objectResult = runQuery(graph, { Node: Node.from(Node) }).toArray();

    // Assert
    typesEqual<typeof singleResult, Node[]>(true);
    typesEqual<typeof arrayResult, [ Node ][]>(true);
    typesEqual<typeof objectResult, { Node: Node }[]>(true);

    deepStrictEqual(singleResult, [ nodeB ]);
    deepStrictEqual(arrayResult, [ [ nodeB ] ]);
    deepStrictEqual(objectResult, [ { Node: nodeB } ]);
  });

  it("Finds nodes with implicit edge to or from them", () => {
    // Arrange
    const graph = new Graph();
    const nodeA = graph.addNode(new NodeA());
    const nodeB = graph.addNode(new NodeB(1));
    const edgeA = graph.addEdge({
      from: nodeA,
      to: nodeB,
    });

    // Act
    const singleResult = runQuery(graph, Node.fromOrTo(Node)).toArray();
    const arrayResult = runQuery(graph, [ Node.fromOrTo(Node) ]).toArray();
    const objectResult = runQuery(graph, { Node: Node.fromOrTo(Node) }).toArray();

    // Assert
    typesEqual<typeof singleResult, Node[]>(true);
    typesEqual<typeof arrayResult, [ Node ][]>(true);
    typesEqual<typeof objectResult, { Node: Node }[]>(true);

    deepStrictEqual(singleResult, [ nodeA, nodeB ]);
    deepStrictEqual(arrayResult, [ [ nodeA ], [ nodeB ] ]);
    deepStrictEqual(objectResult, [ { Node: nodeA }, { Node: nodeB } ]);
  });

  it("Finds nodes with implicit edge to specific node type", () => {
    // Arrange
    const graph = new Graph();
    const nodeA = graph.addNode(new NodeA());
    const nodeB = graph.addNode(new NodeB(1));
    const node = graph.addNode(new Node());
    graph.addEdge({
      from: nodeA,
      to: nodeB,
    });
    graph.addEdge({
      from: nodeB,
      to: node,
    });

    // Act
    const singleResult = runQuery(graph, Node.to(NodeB)).toArray();
    const arrayResult = runQuery(graph, [ Node.to(NodeB) ]).toArray();
    const objectResult = runQuery(graph, { Node: Node.to(NodeB) }).toArray();

    // Assert
    typesEqual<typeof singleResult, Node[]>(true);
    typesEqual<typeof arrayResult, [ Node ][]>(true);
    typesEqual<typeof objectResult, { Node: Node }[]>(true);

    deepStrictEqual(singleResult, [ nodeA ]);
    deepStrictEqual(arrayResult, [ [ nodeA ] ]);
    deepStrictEqual(objectResult, [ { Node: nodeA } ]);
  });

  it("Finds nodes with implicit edge from specific node type", () => {
    // Arrange
    const graph = new Graph();
    const nodeA = graph.addNode(new NodeA());
    const nodeB = graph.addNode(new NodeB(1));
    const node = graph.addNode(new Node());
    graph.addEdge({
      from: nodeA,
      to: nodeB,
    });
    graph.addEdge({
      from: node,
      to: nodeA,
    });

    // Act
    const singleResult = runQuery(graph, Node.from(NodeA)).toArray();
    const arrayResult = runQuery(graph, [ Node.from(NodeA) ]).toArray();
    const objectResult = runQuery(graph, { Node: Node.from(NodeA) }).toArray();

    // Assert
    typesEqual<typeof singleResult, Node[]>(true);
    typesEqual<typeof arrayResult, [ Node ][]>(true);
    typesEqual<typeof objectResult, { Node: Node }[]>(true);

    deepStrictEqual(singleResult, [ nodeB ]);
    deepStrictEqual(arrayResult, [ [ nodeB ] ]);
    deepStrictEqual(objectResult, [ { Node: nodeB } ]);
  });

  it("Finds nodes with implicit edge to or from specific node type", () => {
    // Arrange
    const graph = new Graph();

    const nodeA = graph.addNode(new NodeA());
    const nodeB = graph.addNode(new NodeB(1));
    const node1 = graph.addNode(new Node());
    const node2 = graph.addNode(new Node());
    const node3 = graph.addNode(new Node());
    const node4 = graph.addNode(new Node());

    graph.addEdge({
      from: node1,
      to: nodeA,
    });
    graph.addEdge({
      from: node2,
      to: nodeB,
    });
    graph.addEdge({
      to: node3,
      from: nodeA,
    });
    graph.addEdge({
      to: node4,
      from: nodeB,
    });

    // Act
    const singleResult = runQuery(graph, Node.fromOrTo(NodeB)).toArray();
    const arrayResult = runQuery(graph, [ Node.fromOrTo(NodeB) ]).toArray();
    const objectResult = runQuery(graph, { Node: Node.fromOrTo(NodeB) }).toArray();

    // Assert
    typesEqual<typeof singleResult, Node[]>(true);
    typesEqual<typeof arrayResult, [ Node ][]>(true);
    typesEqual<typeof objectResult, { Node: Node }[]>(true);

    deepStrictEqual(singleResult, [ node4, node2 ]);
    deepStrictEqual(arrayResult, [ [ node4 ], [ node2 ] ]);
    deepStrictEqual(objectResult, [ { Node: node4 }, { Node: node2 } ]);
  });

  it("Does not find self when querying for node with to or from edge to another node", () => {
    // Arrange
    const graph = new Graph();
    const nodeA = graph.addNode(new NodeA());
    const nodeB = graph.addNode(new NodeB(1));
    const edge = graph.addEdge({
      from: nodeA,
      to: nodeB,
    });

    // Act
    const singleResult = runQuery(graph, Node.fromOrTo(NodeA)).toArray();
    const arrayResult = runQuery(graph, [ Node.fromOrTo(NodeA) ]).toArray();
    const objectResult = runQuery(graph, { Node: Node.fromOrTo(NodeA) }).toArray();

    // Assert
    typesEqual<typeof singleResult, Node[]>(true);
    typesEqual<typeof arrayResult, [ Node ][]>(true);
    typesEqual<typeof objectResult, { Node: Node }[]>(true);

    deepStrictEqual(singleResult, [ nodeB ]);
    deepStrictEqual(arrayResult, [[ nodeB ]]);
    deepStrictEqual(objectResult, [{ Node: nodeB }]);
  });

  it("Can (uselessly) name node wild cards", () => {
    // Arrange
    const graph = new Graph();
    const nodeA = graph.addNode(new NodeA());
    const nodeB = graph.addNode(new NodeB(1));

    // Act
    const singleResult = runQuery(graph, Node.as("ref")).toArray();
    const arrayResult = runQuery(graph, [ Node.as("ref") ]).toArray();
    const objectResult = runQuery(graph, { Node: Node.as("ref") }).toArray();

    // Assert
    typesEqual<typeof singleResult, Node[]>(true);
    typesEqual<typeof arrayResult, [ Node ][]>(true);
    typesEqual<typeof objectResult, { Node: Node }[]>(true);

    deepStrictEqual(singleResult, [ nodeA, nodeB ]);
    deepStrictEqual(arrayResult, [ [ nodeA ], [ nodeB ] ]);
    deepStrictEqual(objectResult, [ { Node: nodeA }, { Node: nodeB } ]);
  });

  it("Can (uselessly) name edge wild cards", () => {
    // Arrange
    const graph = new Graph();
    const nodeA = graph.addNode(new NodeA());
    const nodeB = graph.addNode(new NodeB(1));
    const edgeA = graph.addEdge({
      from: nodeA,
      to: nodeB,
    });

    // Act
    const singleResult = runQuery(graph, Edge.as("ref")).toArray();
    const arrayResult = runQuery(graph, [ Edge.as("ref") ]).toArray();
    const objectResult = runQuery(graph, { Edge: Edge.as("ref") }).toArray();

    // Assert
    typesEqual<typeof singleResult, Edge[]>(true);
    typesEqual<typeof arrayResult, [ Edge ][]>(true);
    typesEqual<typeof objectResult, { Edge: Edge }[]>(true);

    deepStrictEqual(singleResult, [ edgeA ]);
    deepStrictEqual(arrayResult, [[ edgeA ]]);
    deepStrictEqual(objectResult, [{ Edge: edgeA }]);
  });

  it("Finds nodes with edge to referenced node", () => {
    // Arrange
    const graph = new Graph();
    const node1 = graph.addNode(new Node());
    const node2 = graph.addNode(new Node());
    const node3 = graph.addNode(new Node());
    const node4 = graph.addNode(new Node());
    graph.addEdge({
      from: node1,
      to: node2,
    });
    graph.addEdge({
      from: node3,
      to: node4,
    });

    // Act
    const arrayResult = runQuery(graph, [
      Node.as("ref"),
      Node.with(Edge.to("ref"))
    ]).toArray();
    const objectResult = runQuery(graph, {
      ref: Node.as("ref"),
      other: Node.with(Edge.to("ref"))
    }).toArray();

    // Assert
    typesEqual<typeof arrayResult, [ Node, Node ][]>(true);
    typesEqual<typeof objectResult, { ref: Node, other: Node }[]>(true);

    deepStrictEqual(arrayResult, [
      [ node2, node1 ],
      [ node4, node3 ],
    ]);
    deepStrictEqual(objectResult, [
      { ref: node2, other: node1 },
      { ref: node4, other: node3 }
    ]);
  });

  it("Finds nodes with edge from referenced node", () => {
    // Arrange
    const graph = new Graph();
    const node1 = graph.addNode(new Node());
    const node2 = graph.addNode(new Node());
    const node3 = graph.addNode(new Node());
    const node4 = graph.addNode(new Node());
    graph.addEdge({
      from: node1,
      to: node2,
    });
    graph.addEdge({
      from: node3,
      to: node4,
    });

    // Act
    const arrayResult = runQuery(graph, [
      Node.as("ref"),
      Node.with(Edge.from("ref"))
    ]).toArray();
    const objectResult = runQuery(graph, {
      ref: Node.as("ref"),
      other: Node.with(Edge.from("ref"))
    }).toArray();

    // Assert
    typesEqual<typeof arrayResult, [ Node, Node ][]>(true);
    typesEqual<typeof objectResult, { ref: Node, other: Node }[]>(true);

    deepStrictEqual(arrayResult, [
      [ node1, node2 ],
      [ node3, node4 ],
    ]);
    deepStrictEqual(objectResult, [
      { ref: node1, other: node2 },
      { ref: node3, other: node4 }
    ]);
  });

  it("Finds nodes with implicit edge to referenced node", () => {
    // Arrange
    const graph = new Graph();
    const node1 = graph.addNode(new Node());
    const node2 = graph.addNode(new Node());
    const node3 = graph.addNode(new Node());
    const node4 = graph.addNode(new Node());
    graph.addEdge({
      from: node1,
      to: node2,
    });
    graph.addEdge({
      from: node3,
      to: node4,
    });

    // Act
    const arrayResult = runQuery(graph, [
      Node.as("ref"),
      Node.to("ref")
    ]).toArray();
    const objectResult = runQuery(graph, {
      ref: Node.as("ref"),
      other: Node.to("ref")
    }).toArray();

    // Assert
    typesEqual<typeof arrayResult, [ Node, Node ][]>(true);
    typesEqual<typeof objectResult, { ref: Node, other: Node }[]>(true);

    deepStrictEqual(arrayResult, [
      [ node2, node1 ],
      [ node4, node3 ],
    ]);
    deepStrictEqual(objectResult, [
      { ref: node2, other: node1 },
      { ref: node4, other: node3 }
    ]);
  });

  it("Finds nodes with implicit edge from referenced node", () => {
    // Arrange
    const graph = new Graph();
    const node1 = graph.addNode(new Node());
    const node2 = graph.addNode(new Node());
    const node3 = graph.addNode(new Node());
    const node4 = graph.addNode(new Node());
    graph.addEdge({
      from: node1,
      to: node2,
    });
    graph.addEdge({
      from: node3,
      to: node4,
    });

    // Act
    const arrayResult = runQuery(graph, [
      Node.as("ref"),
      Node.from("ref")
    ]).toArray();
    const objectResult = runQuery(graph, {
      ref: Node.as("ref"),
      other: Node.from("ref")
    }).toArray();

    // Assert
    typesEqual<typeof arrayResult, [ Node, Node ][]>(true);
    typesEqual<typeof objectResult, { ref: Node, other: Node }[]>(true);

    deepStrictEqual(arrayResult, [
      [ node1, node2 ],
      [ node3, node4 ],
    ]);
    deepStrictEqual(objectResult, [
      { ref: node1, other: node2 },
      { ref: node3, other: node4 }
    ]);
  });

  it("Finds nodes with edge to referenced node of specific type", () => {
    // Arrange
    const graph = new Graph();
    const node1 = graph.addNode(new Node());
    const node2 = graph.addNode(new NodeA());
    const node3 = graph.addNode(new Node());
    const node4 = graph.addNode(new NodeB(1));
    graph.addEdge({
      from: node1,
      to: node2,
    });
    graph.addEdge({
      from: node3,
      to: node4,
    });

    // Act
    const arrayResult = runQuery(graph, [
      NodeA.as("ref"),
      Node.to("ref")
    ]).toArray();
    const objectResult = runQuery(graph, {
      ref: NodeA.as("ref"),
      other: Node.to("ref")
    }).toArray();

    // Assert
    typesEqual<typeof arrayResult, [ NodeA, Node ][]>(true);
    typesEqual<typeof objectResult, { ref: NodeA, other: Node }[]>(true);

    deepStrictEqual(arrayResult, [
      [ node2, node1 ],
    ]);
    deepStrictEqual(objectResult, [
      { ref: node2, other: node1 },
    ]);
  });

  it("Finds nodes with edge from referenced node of specific type", () => {
    // Arrange
    const graph = new Graph();
    const node1 = graph.addNode(new Node());
    const node2 = graph.addNode(new NodeA());
    const node3 = graph.addNode(new Node());
    const node4 = graph.addNode(new NodeB(1));
    graph.addEdge({
      from: node2,
      to: node1,
    });
    graph.addEdge({
      from: node4,
      to: node3,
    });

    // Act
    const arrayResult = runQuery(graph, [
      NodeB.as("ref"),
      Node.from("ref")
    ]).toArray();
    const objectResult = runQuery(graph, {
      ref: NodeB.as("ref"),
      other: Node.from("ref")
    }).toArray();

    // Assert
    typesEqual<typeof arrayResult, [ NodeB, Node ][]>(true);
    typesEqual<typeof objectResult, { ref: NodeB, other: Node }[]>(true);

    deepStrictEqual(arrayResult, [
      [ node4, node3 ],
    ]);
    deepStrictEqual(objectResult, [
      { ref: node4, other: node3 },
    ]);
  });

  it("Throws if node reference has conflicting types", () => {
    // Arrange
    const graph = new Graph();

    // Act
    const arrayQuery = () => runQuery(graph, [
      NodeA.as("ref"),
      NodeB.as("ref")
    ]).toArray();
    const objectQuery = () => runQuery(graph, {
      a: NodeA.as("ref"),
      b: NodeB.as("ref"),
    }).toArray();

    // Assert
    throws(
      arrayQuery,
      { name: ReferenceMismatchError.name }
    );
    throws(
      objectQuery,
      { name: ReferenceMismatchError.name }
    );
  });

  it("Throws if edge reference has conflicting types", () => {
    // Arrange
    const graph = new Graph();

    // Act
    const arrayQuery = () => runQuery(graph, [
      EdgeA.as("ref"),
      EdgeB.as("ref")
    ]).toArray();
    const objectQuery = () => runQuery(graph, {
      a: EdgeA.as("ref"),
      b: EdgeB.as("ref"),
    }).toArray();

    // Assert
    throws(
      arrayQuery,
      { name: ReferenceMismatchError.name }
    );
    throws(
      objectQuery,
      { name: ReferenceMismatchError.name }
    );
  });

  it("Finds referenced node when references are for both a child class and a parent class", () => {
    // Arrange
    const graph = new Graph();
    const nodeA = graph.addNode(new ChildOfNodeA());
    const nodeB = graph.addNode(new NodeB(1));

    // Act
    const arrayResult = runQuery(graph, [
      ChildOfNodeA.as("ref"),
      NodeA.as("ref"),
    ]).toArray();
    const objectResult = runQuery(graph, {
      a: ChildOfNodeA.as("ref"),
      b: NodeA.as("ref"),
    }).toArray();

    // Assert
    typesEqual<typeof arrayResult, [ ChildOfNodeA, Node ][]>(true);
    typesEqual<typeof objectResult, { a: ChildOfNodeA, b: Node }[]>(true);

    deepStrictEqual(arrayResult, [
      [ nodeA, nodeA ],
    ]);
    deepStrictEqual(objectResult, [
      { a: nodeA, b: nodeA },
    ]);
  });

  it("Finds referenced edge when references are for both a child class and a parent class", () => {
    // Arrange
    const graph = new Graph();
    const node = graph.addNode(new Node());
    const edgeA = graph.addEdge({
      from: node,
      to: node,
      edge: new ChildOfEdgeA(),
    });

    // Act
    const arrayResult = runQuery(graph, [
      ChildOfEdgeA.as("ref"),
      EdgeA.as("ref"),
    ]).toArray();
    const objectResult = runQuery(graph, {
      a: ChildOfEdgeA.as("ref"),
      b: EdgeA.as("ref"),
    }).toArray();

    // Assert
    typesEqual<typeof arrayResult, [ ChildOfEdgeA, EdgeA ][]>(true);
    typesEqual<typeof objectResult, { a: ChildOfEdgeA, b: EdgeA }[]>(true);

    deepStrictEqual(arrayResult, [
      [ edgeA, edgeA ],
    ]);
    deepStrictEqual(objectResult, [
      { a: edgeA, b: edgeA },
    ]);
  });

  it("Throws if reference is both a node and an edge", () => {
    // Arrange
    const graph = new Graph();

    // Act
    const arrayQuery = () => runQuery(graph, [
      Node.as("ref"),
      Edge.as("ref"),
    ]).toArray();
    const objectQuery = () => runQuery(graph, {
      a: Node.as("ref"),
      b: Edge.as("ref"),
    }).toArray();

    // Assert
    throws(
      arrayQuery,
      { name: ReferenceMismatchError.name }
    );
    throws(
      objectQuery,
      { name: ReferenceMismatchError.name }
    );
  });

  it("Finds anything when querying just a string item", () => {
    // Arrange
    const graph = new Graph();
    const node = graph.addNode(new Node());
    const edge = graph.addEdge({
      from: node,
      to: node,
    });

    // Act
    const singleResult = runQuery(graph, "ref").toArray();
    const arrayResult = runQuery(graph, [ "ref" ]).toArray();
    const objectResult = runQuery(graph, { ref: "ref" }).toArray();

    // Assert
    typesEqual<typeof singleResult, (Node | Edge)[]>(true);
    typesEqual<typeof arrayResult, [ Node | Edge ][]>(true);
    typesEqual<typeof objectResult, { ref: Node | Edge }[]>(true);

    deepStrictEqual(singleResult, [ node, edge ]);
    deepStrictEqual(arrayResult, [ [node], [edge] ]);
    deepStrictEqual(objectResult, [ { ref: node }, { ref: edge } ]);
  });

  it("Finds and returns referenced node by string when string is first", () => {
    // Arrange
    const graph = new Graph();
    const nodeA = graph.addNode(new NodeA());

    // Act
    const arrayResult = runQuery(graph, [ "ref", NodeA.as("ref") ]).toArray();
    const objectResult = runQuery(graph, { a: "ref", b: NodeA.as("ref") } as const).toArray();

    // Assert
    typesEqual<typeof arrayResult, [ NodeA, NodeA ][]>(true);
    typesEqual<typeof objectResult, { a: NodeA, b: NodeA }[]>(true);

    deepStrictEqual(arrayResult, [ [ nodeA, nodeA ] ]);
    deepStrictEqual(objectResult, [ { a: nodeA, b: nodeA } ]);
  })

  it("Finds and returns referenced node by string when string is last", () => {
    // Arrange
    const graph = new Graph();
    const nodeA = graph.addNode(new NodeA());

    // Act
    const arrayResult = runQuery(graph, [ NodeA.as("ref"), "ref" ]).toArray();
    const objectResult = runQuery(graph, { a: NodeA.as("ref"), b: "ref" } as const).toArray();

    // Assert
    typesEqual<typeof arrayResult, [ NodeA, NodeA ][]>(true);
    typesEqual<typeof objectResult, { a: NodeA, b: NodeA }[]>(true);

    deepStrictEqual(arrayResult, [ [ nodeA, nodeA ] ]);
    deepStrictEqual(objectResult, [ { a: nodeA, b: nodeA } ]);
  })

  it("Finds and returns referenced edge by string when string is first", () => {
    // Arrange
    const graph = new Graph();
    const node = graph.addNode(new Node());
    const edge = graph.addEdge({
      from: node,
      to: node,
    });

    // Act
    const arrayResult = runQuery(graph, [ "ref", Edge.as("ref") ]).toArray();
    const objectResult = runQuery(graph, { a: "ref", b: Edge.as("ref") } as const).toArray();

    // Assert
    typesEqual<typeof arrayResult, [ Edge, Edge ][]>(true);
    typesEqual<typeof objectResult, { a: Edge, b: Edge }[]>(true);

    deepStrictEqual(arrayResult, [ [ edge, edge ] ]);
    deepStrictEqual(objectResult, [ { a: edge, b: edge } ]);
  });

  it("Finds and returns referenced edge by string when string is last", () => {
    // Arrange
    const graph = new Graph();
    const node = graph.addNode(new Node());
    const edge = graph.addEdge({
      from: node,
      to: node,
    });

    // Act
    const arrayResult = runQuery(graph, [ Edge.as("ref"), "ref" ]).toArray();
    const objectResult = runQuery(graph, { a: Edge.as("ref"), b: "ref" } as const).toArray();

    // Assert
    typesEqual<typeof arrayResult, [ Edge, Edge ][]>(true);
    typesEqual<typeof objectResult, { a: Edge, b: Edge }[]>(true);

    deepStrictEqual(arrayResult, [ [ edge, edge ] ]);
    deepStrictEqual(objectResult, [ { a: edge, b: edge } ]);
  });

  it("Finds and returns node by ref and edge to that node", () => {
    // Arrange
    const graph = new Graph();
    const node = graph.addNode(new Node());
    const edge = graph.addEdge({
      from: node,
      to: node,
    });

    // Act
    const arrayResult = runQuery(graph, [ "node", Edge.to("node") ]).toArray();
    const objectResult = runQuery(graph, { node: "node", edge: Edge.to("node") } as const).toArray();

    // Assert
    typesEqual<typeof arrayResult, [ Node, Edge ][]>(true);
    typesEqual<typeof objectResult, { node: Node, edge: Edge }[]>(true);

    deepStrictEqual(arrayResult, [ [ node, edge ] ]);
    deepStrictEqual(objectResult, [ { node, edge } ]);
  });

  it("Finds and returns node with referenced edge to referenced target", () => {
    // Arrange
    const graph = new Graph();
    const node1 = graph.addNode(new Node());
    const node2 = graph.addNode(new Node());
    const edge = graph.addEdge({
      from: node1,
      to: node2,
    });

    // Act
    const arrayResult = runQuery(graph, [
      Node.with(Edge.as("edge").to("target")),
      "edge",
      "target",
    ]).toArray();
    const objectResult = runQuery(graph, {
      node: Node.with(Edge.as("edge").to("target")),
      edge: "edge",
      target: "target",
    } as const).toArray();

    // Assert
    typesEqual<typeof arrayResult, [ Node, Edge, Node ][]>(true);
    typesEqual<typeof objectResult, { node: Node, edge: Edge, target: Node }[]>(true);

    deepStrictEqual(arrayResult, [ [ node1, edge, node2 ] ]);
    deepStrictEqual(objectResult, [ { node: node1, edge: edge, target: node2 } ]);
  });

  it("Finds and returns node of specific type with referenced edge of specific type to referenced target of specific type", () => {
    // Arrange
    const graph = new Graph();
    const node1 = graph.addNode(new NodeA());
    const node2 = graph.addNode(new NodeB(1));
    const node3 = graph.addNode(new NodeA());
    const node4 = graph.addNode(new NodeB(1));
    const node5 = graph.addNode(new NodeA());
    const node6 = graph.addNode(new NodeB(1));
    const edge = graph.addEdge({
      from: node1,
      to: node2,
      edge: new EdgeA(),
    });
    const edge2 = graph.addEdge({
      from: node3,
      to: node4,
      edge: new EdgeB(1),
    });

    // Act
    const arrayResult = runQuery(graph, [
      NodeA.with(EdgeA.as("edge").to(NodeB.as("target"))),
      "edge",
      "target",
    ]).toArray();
    const objectResult = runQuery(graph, {
      node: NodeA.with(EdgeA.as("edge").to(NodeB.as("target"))),
      edge: "edge",
      target: "target",
    } as const).toArray();

    // Assert
    typesEqual<typeof arrayResult, [ NodeA, EdgeA, NodeB ][]>(true);
    typesEqual<typeof objectResult, { node: NodeA, edge: EdgeA, target: NodeB }[]>(true);

    deepStrictEqual(arrayResult, [ [ node1, edge, node2 ] ]);
    deepStrictEqual(objectResult, [ { node: node1, edge: edge, target: node2 } ]);
  });

  it("Can reference same node from multiple places", () => {
    // Arrange
    const graph = new Graph();

    const node1 = graph.addNode(new NodeA());
    const node2 = graph.addNode(new Node());
    const node3 = graph.addNode(new Node());
    const node4 = graph.addNode(new NodeA());
    const node5 = graph.addNode(new Node());
    const node6 = graph.addNode(new Node());
    const node7 = graph.addNode(new NodeA());

    graph.addEdge({ from: node1, to: node2 });
    graph.addEdge({ from: node1, to: node3 });
    graph.addEdge({ from: node4, to: node5 });
    graph.addEdge({ from: node7, to: node6 });

    // Act
    const arrayResult = runQuery(graph, [
      Node.from("ref"),
      Node.from("ref"),
      Node.as("ref"),
    ]).toArray();
    const objectResult = runQuery(graph, {
      a: Node.from("ref"),
      b: Node.from("ref"),
      ref: Node.as("ref"),
    }).toArray();

    // Assert
    typesEqual<typeof arrayResult, [ Node, Node, Node ][]>(true);
    typesEqual<typeof objectResult, { a: Node, b: Node, ref: Node }[]>(true);

    deepStrictEqual(arrayResult, [
      [ node2, node2, node1 ],
      [ node2, node3, node1 ],
      [ node3, node2, node1 ],
      [ node3, node3, node1 ],
      [ node5, node5, node4 ],
      [ node6, node6, node7 ],
    ]);
    deepStrictEqual(objectResult, [
      { a: node2, b: node2, ref: node1 },
      { a: node2, b: node3, ref: node1 },
      { a: node3, b: node2, ref: node1 },
      { a: node3, b: node3, ref: node1 },
      { a: node5, b: node5, ref: node4 },
      { a: node6, b: node6, ref: node7 },
    ]);
  });

  it("Can circularly reference nodes (smol)", () => {
    // Arrange
    const graph = new Graph();

    const node1 = graph.addNode(new Node());
    const node2 = graph.addNode(new Node());

    graph.addEdge({ from: node1, to: node2 });
    graph.addEdge({ from: node2, to: node1 });

    // Act
    const arrayResult = runQuery(graph, [
      Node.as("a").with(Edge.as("a-to-b").to("b")),
      Node.as("b").with(Edge.as("b-to-a").to("a")),
    ]).toArray();

    // Assert
    typesEqual<typeof arrayResult, [ Node, Node ][]>(true);

    deepStrictEqual(arrayResult, [
      [ node2, node1 ],
      [ node1, node2 ],
    ]);
  });

  it("Can circularly reference nodes", () => {
    // Arrange
    const graph = new Graph();

    const node1 = graph.addNode(new Node());
    const node2 = graph.addNode(new Node());
    const node3 = graph.addNode(new Node());
    const node4 = graph.addNode(new Node());
    const node5 = graph.addNode(new Node());
    const node6 = graph.addNode(new Node());
    const node7 = graph.addNode(new Node());

    graph.addEdge({ from: node1, to: node2 });
    graph.addEdge({ from: node2, to: node3 });
    graph.addEdge({ from: node3, to: node1 });
    graph.addEdge({ from: node4, to: node5 });
    graph.addEdge({ from: node5, to: node6 });
    graph.addEdge({ from: node6, to: node7 });

    // Act
    const arrayResult = runQuery(graph, [
      Node.as("a").to("b"),
      Node.as("b").to("c"),
      Node.as("c").to("a"),
    ]).toArray();
    const objectResult = runQuery(graph, {
      a: Node.as("a").to("b"),
      b: Node.as("b").to("c"),
      c: Node.as("c").to("a"),
    }).toArray();

    // Assert
    typesEqual<typeof arrayResult, [ Node, Node, Node ][]>(true);
    typesEqual<typeof objectResult, { a: Node, b: Node, c: Node }[]>(true);

    deepStrictEqual(arrayResult, [
      [ node3, node1, node2 ],
      [ node1, node2, node3 ],
      [ node2, node3, node1 ],
    ]);
    deepStrictEqual(objectResult, [
      { a: node3, b: node1, c: node2 },
      { a: node1, b: node2, c: node3 },
      { a: node2, b: node3, c: node1 },
    ]);
  });

  it("Can reference edges in multiple places", () => {
    // Arrange
    const graph = new Graph();

    const node1 = graph.addNode(new NodeA());
    const node2 = graph.addNode(new Node());
    const node3 = graph.addNode(new NodeA());
    const node4 = graph.addNode(new Node());

    const edge1 = graph.addEdge({ from: node2, to: node1 });
    const edge2 = graph.addEdge({ from: node3, to: node4 });

    // Act
    const arrayResult = runQuery(graph, [
      Edge.as("e").to(NodeA),
      NodeA.with("e"),
      Node.with("e"),
    ]).toArray();
    const objectResult = runQuery(graph, {
      edge: Edge.as("e").to(NodeA),
      a: NodeA.with("e"),
      b: Node.with("e"),
    }).toArray();

    // Assert
    typesEqual<typeof arrayResult, [ Edge, NodeA, Node ][]>(true);
    typesEqual<typeof objectResult, { edge: Edge, a: NodeA, b: Node }[]>(true);

    deepStrictEqual(arrayResult, [
      [ edge1, node1, node2 ],
    ]);
    deepStrictEqual(objectResult, [
      { edge: edge1, a: node1, b: node2 },
    ]);
  });

  it("Can specify multiple to items", () => {
    // Arrange
    const graph = new Graph();

    const node1 = graph.addNode(new Node());
    const node2 = graph.addNode(new NodeA());
    const node3 = graph.addNode(new NodeB(1));
    const node4 = graph.addNode(new Node());
    const node5 = graph.addNode(new NodeA());
    const node6 = graph.addNode(new Node());

    graph.addEdge({ from: node1, to: node2 });
    graph.addEdge({ from: node1, to: node3 });
    graph.addEdge({ from: node4, to: node5 });
    graph.addEdge({ from: node4, to: node6 });

    // Act
    const singleResult = runQuery(graph,
      Node.to(NodeA, NodeB)
    ).toArray();
    const arrayResult = runQuery(graph, [
      Node.to(NodeA, NodeB),
    ]).toArray();
    const objectResult = runQuery(graph, {
      node: Node.to(NodeA, NodeB),
    }).toArray();

    // Assert
    typesEqual<typeof singleResult, Node[]>(true);
    typesEqual<typeof arrayResult, [ Node ][]>(true);
    typesEqual<typeof objectResult, { node: Node }[]>(true);

    deepStrictEqual(singleResult, [ node1 ]);
    deepStrictEqual(arrayResult, [ [ node1 ] ]);
    deepStrictEqual(objectResult, [ { node: node1 } ]);
  });

  it("Can specify multiple from items", () => {
    // Arrange
    const graph = new Graph();

    const node1 = graph.addNode(new Node());
    const node2 = graph.addNode(new NodeA());
    const node3 = graph.addNode(new NodeB(1));
    const node4 = graph.addNode(new Node());
    const node5 = graph.addNode(new NodeA());
    const node6 = graph.addNode(new Node());

    graph.addEdge({ from: node2, to: node1 });
    graph.addEdge({ from: node3, to: node1 });
    graph.addEdge({ from: node5, to: node4 });
    graph.addEdge({ from: node6, to: node4 });

    // Act
    const singleResult = runQuery(graph,
      Node.from(NodeA, NodeB)
    ).toArray();
    const arrayResult = runQuery(graph, [
      Node.from(NodeA, NodeB),
    ]).toArray();
    const objectResult = runQuery(graph, {
      node: Node.from(NodeA, NodeB),
    }).toArray();

    // Assert
    typesEqual<typeof singleResult, Node[]>(true);
    typesEqual<typeof arrayResult, [ Node ][]>(true);
    typesEqual<typeof objectResult, { node: Node }[]>(true);

    deepStrictEqual(singleResult, [ node1 ]);
    deepStrictEqual(arrayResult, [ [ node1 ] ]);
    deepStrictEqual(objectResult, [ { node: node1 } ]);
  });

  it("Can specify multiple from and to items", () => {
    // Arrange
    const graph = new Graph();

    const node1 = graph.addNode(new Node());
    const node2 = graph.addNode(new NodeA());
    const node3 = graph.addNode(new NodeB(1));
    const node4 = graph.addNode(new Node());
    const node5 = graph.addNode(new NodeA());
    const node6 = graph.addNode(new Node());

    graph.addEdge({ from: node1, to: node2 });
    graph.addEdge({ from: node3, to: node1 });
    graph.addEdge({ from: node4, to: node5 });
    graph.addEdge({ from: node6, to: node4 });

    // Act
    const singleResult = runQuery(graph,
      Node.fromOrTo(NodeA, NodeB),
    ).toArray();
    const arrayResult = runQuery(graph, [
      Node.fromOrTo(NodeA, NodeB),
    ]).toArray();
    const objectResult = runQuery(graph, {
      node: Node.fromOrTo(NodeA, NodeB),
    }).toArray();

    // Assert
    typesEqual<typeof singleResult, Node[]>(true);
    typesEqual<typeof arrayResult, [ Node ][]>(true);
    typesEqual<typeof objectResult, { node: Node }[]>(true);

    deepStrictEqual(singleResult, [ node1 ]);
    deepStrictEqual(arrayResult, [ [ node1 ] ]);
    deepStrictEqual(objectResult, [ { node: node1 } ]);
  });

  it("Can specify multiple with items", () => {
    // Arrange
    const graph = new Graph();

    const node1 = graph.addNode(new Node());
    const node2 = graph.addNode(new Node());
    const node3 = graph.addNode(new Node());
    const node4 = graph.addNode(new Node());
    const node5 = graph.addNode(new Node());
    const node6 = graph.addNode(new Node());

    graph.addEdge({ from: node1, to: node2, edge: new EdgeA() });
    graph.addEdge({ from: node1, to: node3, edge: new EdgeB(1) });
    graph.addEdge({ from: node4, to: node5, edge: new EdgeA() });
    graph.addEdge({ from: node4, to: node6 });

    // Act
    const singleResult = runQuery(graph,
      Node.with(EdgeA, EdgeB),
    ).toArray();
    const arrayResult = runQuery(graph, [
      Node.with(EdgeA, EdgeB),
    ]).toArray();
    const objectResult = runQuery(graph, {
      node: Node.with(EdgeA, EdgeB),
    }).toArray();

    // Assert
    typesEqual<typeof singleResult, Node[]>(true);
    typesEqual<typeof arrayResult, [ Node ][]>(true);
    typesEqual<typeof objectResult, { node: Node }[]>(true);

    deepStrictEqual(singleResult, [ node1 ]);
    deepStrictEqual(arrayResult, [ [ node1 ] ]);
    deepStrictEqual(objectResult, [ { node: node1 } ]);
  });

  it("Finds nodes with edge to self", () => {
    // Arrange
    const graph = new Graph();

    const node1 = graph.addNode(new Node());
    const node2 = graph.addNode(new Node());

    graph.addEdge({ from: node1, to: node1 });
    graph.addEdge({ from: node1, to: node2 });

    // Act
    const singleResult = runQuery(graph, Node.as("n").to("n")).toArray();
    const arrayResult = runQuery(graph, [ Node.as("n").to("n") ]).toArray();
    const objectResult = runQuery(graph, { node: Node.as("n").to("n") }).toArray();

    // Assert
    typesEqual<typeof singleResult, Node[]>(true);
    typesEqual<typeof arrayResult, [ Node ][]>(true);
    typesEqual<typeof objectResult, { node: Node }[]>(true);

    deepStrictEqual(singleResult, [ node1 ]);
    deepStrictEqual(arrayResult, [ [ node1 ] ]);
    deepStrictEqual(objectResult, [ { node: node1 } ]);
  });

  it("Finds specific node instance", () => {
    // Arrange
    const graph = new Graph();

    const node1 = graph.addNode(new Node());
    const node2 = graph.addNode(new Node());

    // Act
    const singleResult = runQuery(graph, node2).toArray();
    const arrayResult = runQuery(graph, [ node2 ]).toArray();
    const objectResult = runQuery(graph, { node2 }).toArray();

    // Assert
    typesEqual<typeof singleResult, Node[]>(true);
    typesEqual<typeof arrayResult, [ Node ][]>(true);
    typesEqual<typeof objectResult, { node2: Node }[]>(true);

    deepStrictEqual(singleResult, [ node2 ]);
    deepStrictEqual(arrayResult, [ [ node2 ] ]);
    deepStrictEqual(objectResult, [ { node2 } ]);
  });

  it("Finds specific edge instance", () => {
    // Arrange
    const graph = new Graph();

    const node1 = graph.addNode(new Node());
    const node2 = graph.addNode(new Node());
    const edge1 = graph.addEdge({ from: node1, to: node2 });
    const edge2 = graph.addEdge({ from: node1, to: node2 });

    // Act
    const singleResult = runQuery(graph, edge1).toArray();
    const arrayResult = runQuery(graph, [ edge1 ]).toArray();
    const objectResult = runQuery(graph, { edge1 }).toArray();

    // Assert
    typesEqual<typeof singleResult, Edge[]>(true);
    typesEqual<typeof arrayResult, [ Edge ][]>(true);
    typesEqual<typeof objectResult, { edge1: Edge }[]>(true);

    deepStrictEqual(singleResult, [ edge1 ]);
    deepStrictEqual(arrayResult, [ [ edge1 ] ]);
    deepStrictEqual(objectResult, [ { edge1 } ]);
  });

  it("Finds nodes with implicit edge to specific node instance", () => {
    // Arrange
    const graph = new Graph();

    const node1 = graph.addNode(new Node());
    const node2 = graph.addNode(new Node());
    const node3 = graph.addNode(new Node());
    graph.addEdge({ from: node1, to: node2 });
    graph.addEdge({ from: node2, to: node3 });

    // Act
    const singleResult = runQuery(graph, Node.to(node2)).toArray();
    const arrayResult = runQuery(graph, [ Node.to(node2) ]).toArray();
    const objectResult = runQuery(graph, { node: Node.to(node2) }).toArray();

    // Assert
    typesEqual<typeof singleResult, Node[]>(true);
    typesEqual<typeof arrayResult, [ Node ][]>(true);
    typesEqual<typeof objectResult, { node: Node }[]>(true);

    deepStrictEqual(singleResult, [ node1 ]);
    deepStrictEqual(arrayResult, [ [ node1 ] ]);
    deepStrictEqual(objectResult, [ { node: node1 } ]);
  });

  it("Finds nodes with implicit edge from specific node instance", () => {
    // Arrange
    const graph = new Graph();

    const node1 = graph.addNode(new Node());
    const node2 = graph.addNode(new Node());
    const node3 = graph.addNode(new Node());
    graph.addEdge({ from: node2, to: node1 });
    graph.addEdge({ from: node3, to: node2 });

    // Act
    const singleResult = runQuery(graph, Node.from(node2)).toArray();
    const arrayResult = runQuery(graph, [ Node.from(node2) ]).toArray();
    const objectResult = runQuery(graph, { node: Node.from(node2) }).toArray();

    // Assert
    typesEqual<typeof singleResult, Node[]>(true);
    typesEqual<typeof arrayResult, [ Node ][]>(true);
    typesEqual<typeof objectResult, { node: Node }[]>(true);

    deepStrictEqual(singleResult, [ node1 ]);
    deepStrictEqual(arrayResult, [ [ node1 ] ]);
    deepStrictEqual(objectResult, [ { node: node1 } ]);
  });

  it("Finds nodes with implicit edge to or from specific node instance", () => {
    // Arrange
    const graph = new Graph();

    const node1 = graph.addNode(new Node());
    const node2 = graph.addNode(new Node());
    const node3 = graph.addNode(new Node());
    const node4 = graph.addNode(new Node());
    const node5 = graph.addNode(new Node());
    const node6 = graph.addNode(new Node());
    graph.addEdge({ from: node1, to: node2 });
    graph.addEdge({ from: node3, to: node1 });
    graph.addEdge({ from: node4, to: node5 });
    graph.addEdge({ from: node6, to: node4 });


    // Act
    const singleResult = runQuery(graph, Node.fromOrTo(node1)).toArray();
    const arrayResult = runQuery(graph, [ Node.fromOrTo(node1) ]).toArray();
    const objectResult = runQuery(graph, { node: Node.fromOrTo(node1) }).toArray();

    // Assert
    typesEqual<typeof singleResult, Node[]>(true);
    typesEqual<typeof arrayResult, [ Node ][]>(true);
    typesEqual<typeof objectResult, { node: Node }[]>(true);

    deepStrictEqual(singleResult, [ node2, node3 ]);
    deepStrictEqual(arrayResult, [ [ node2 ], [ node3 ] ]);
    deepStrictEqual(objectResult, [ { node: node2 }, { node: node3 } ]);
  });

  it("Finds nodes with specific edge instance", () => {
    // Arrange
    const graph = new Graph();

    const node1 = graph.addNode(new Node());
    const node2 = graph.addNode(new Node());
    const node3 = graph.addNode(new Node());

    const edge1 = graph.addEdge({ from: node1, to: node2 });
    const edge2 = graph.addEdge({ from: node2, to: node3 });

    // Act
    const singleResult = runQuery(graph, Node.with(edge1)).toArray();
    const arrayResult = runQuery(graph, [ Node.with(edge1) ]).toArray();
    const objectResult = runQuery(graph, { node: Node.with(edge1) }).toArray();

    // Assert
    typesEqual<typeof singleResult, Node[]>(true);
    typesEqual<typeof arrayResult, [ Node ][]>(true);
    typesEqual<typeof objectResult, { node: Node }[]>(true);

    deepStrictEqual(singleResult, [ node1, node2 ]);
    deepStrictEqual(arrayResult, [ [ node1 ], [ node2 ] ]);
    deepStrictEqual(objectResult, [ { node: node1 }, { node: node2 } ]);
  });

  it("Excludes nodes of a specified type", () => {
    // Arrange
    const graph = new Graph();

    const node1 = graph.addNode(new Node());
    const node2 = graph.addNode(new NodeA());
    const node3 = graph.addNode(new ChildOfNodeA());
    const node4 = graph.addNode(new NodeB(1));

    // Act
    const singleResult = runQuery(graph, Node.excluding(NodeA)).toArray();
    const arrayResult = runQuery(graph, [ Node.excluding(NodeA) ]).toArray();
    const objectResult = runQuery(graph, { node: Node.excluding(NodeA) }).toArray();

    // Assert
    typesEqual<typeof singleResult, Node[]>(true);
    typesEqual<typeof arrayResult, [ Node ][]>(true);
    typesEqual<typeof objectResult, { node: Node }[]>(true);

    deepStrictEqual(singleResult, [ node1, node4 ]);
    deepStrictEqual(arrayResult, [ [ node1 ], [ node4 ] ]);
    deepStrictEqual(objectResult, [ { node: node1 }, { node: node4 } ]);
  });

  it("Excludes edges of a specified type", () => {
    // Arrange
    const graph = new Graph();

    const node1 = graph.addNode(new Node());
    const node2 = graph.addNode(new Node());

    const edge1 = graph.addEdge({ from: node1, to: node2 });
    const edge2 = graph.addEdge({ from: node1, to: node2, edge: new EdgeA() });
    const edge3 = graph.addEdge({ from: node1, to: node2, edge: new ChildOfEdgeA() });
    const edge4 = graph.addEdge({ from: node1, to: node2, edge: new EdgeB(1) });


    // Act
    const singleResult = runQuery(graph, Edge.excluding(EdgeA)).toArray();
    const arrayResult = runQuery(graph, [ Edge.excluding(EdgeA) ]).toArray();
    const objectResult = runQuery(graph, { edge: Edge.excluding(EdgeA) }).toArray();

    // Assert
    typesEqual<typeof singleResult, Edge[]>(true);
    typesEqual<typeof arrayResult, [ Edge ][]>(true);
    typesEqual<typeof objectResult, { edge: Edge }[]>(true);

    deepStrictEqual(singleResult, [ edge1, edge4 ]);
    deepStrictEqual(arrayResult, [ [ edge1 ], [ edge4 ] ]);
    deepStrictEqual(objectResult, [ { edge: edge1 }, { edge: edge4 } ]);
  });

  it("Finds nodes and an edge", () => {
    // Arrange
    const graph = new Graph();

    const node1 = graph.addNode(new Node());
    const node2 = graph.addNode(new Node());
    const node3 = graph.addNode(new Node());

    const edge1 = graph.addEdge({ from: node1, to: node2 });

    // Act
    const arrayResult = runQuery(graph, [
      Node.as("n1"),
      Edge.from("n1").to("n2"),
    ]).toArray();
    const objectResult = runQuery(graph, {
      n1: Node.as("n1"),
      edge: Edge.from("n1").to("n2"),
    }).toArray();

    // Assert
    typesEqual<typeof arrayResult, [ Node, Edge ][]>(true);
    typesEqual<typeof objectResult, { n1: Node, edge: Edge }[]>(true);

    deepStrictEqual(arrayResult, [ [ node1, edge1 ] ]);
    deepStrictEqual(objectResult, [ { n1: node1, edge: edge1 } ]);
  });



  describe("Spaceship example", () => {
    // Finds spaceships docked to planets that are ruled by factions
    // that are allied with the faction of the spaceship.

    class Faction extends Node {}
    class Planet extends Node {}
    class Spaceship extends Node { name: string; constructor(name: string) { super(); this.name = name; } }
    class Allied extends Edge {}
    class RuledBy extends Edge {}
    class Docked extends Edge {}
    class IsIn extends Edge {}

    function setupSpaceships(graph: Graph) {
      const empire = graph.addNode(new Faction());
      const rebels = graph.addNode(new Faction());
      const bountyHunters = graph.addNode(new Faction());

      const deathStar = graph.addNode(new Spaceship("Death Star"));
      const millenniumFalcon = graph.addNode(new Spaceship("Millennium Falcon"));
      const tieFighter = graph.addNode(new Spaceship("Tie Fighter"));
      const bountyShip = graph.addNode(new Spaceship("Bounty Ship"));

      const alderaan = graph.addNode(new Planet());
      const tatooine = graph.addNode(new Planet());
      const endor = graph.addNode(new Planet());

      // I haven't watched Star Wars, don't @ me
      deathStar.addEdge({ edge: new IsIn(), to: empire });
      tieFighter.addEdge({ edge: new IsIn(), to: empire });
      millenniumFalcon.addEdge({ edge: new IsIn(), to: rebels });
      bountyShip.addEdge({ edge: new IsIn(), to: bountyHunters });

      alderaan.addEdge({ edge: new RuledBy(), to: empire });
      tatooine.addEdge({ edge: new RuledBy(), to: empire });
      endor.addEdge({ edge: new RuledBy(), to: rebels });

      deathStar.addEdge({ edge: new Docked(), to: alderaan });
      millenniumFalcon.addEdge({ edge: new Docked(), to: tatooine });
      tieFighter.addEdge({ edge: new Docked(), to: endor });
      bountyShip.addEdge({ edge: new Docked(), to: tatooine });

      empire.addEdge({ edge: new Allied(), to: bountyHunters });
      empire.addEdge({ edge: new Allied(), to: empire });
      rebels.addEdge({ edge: new Allied(), to: rebels });
      bountyHunters.addEdge({ edge: new Allied(), to: bountyHunters });

      return { deathStar, millenniumFalcon, tieFighter, bountyShip };
    }

    it("Precise but verbose version", () => {
      // Arrange
      const graph = new Graph();

      const { deathStar, bountyShip } = setupSpaceships(graph);

      // Act
      const singleResult = runQuery(graph,
        Spaceship.with(
          IsIn.to(
            Faction.as("faction")
          ),
          Docked.to(
            Planet.with(
              RuledBy.to(
                Faction.with(
                  Allied.to(
                    Faction.as("faction")
                  )
                )
              )
            )
          )
        ),
      ).toArray();

      // Assert
      typesEqual<typeof singleResult, Spaceship[]>(true);

      deepStrictEqual(singleResult, [ bountyShip, deathStar ]);
    });

    it("Short but vague version", () => {
      // Arrange
      const graph = new Graph();

      const { deathStar, bountyShip } = setupSpaceships(graph);

      // Act
      const singleResult = runQuery(graph,
        Spaceship.to(
          Faction.as("faction"),
          Planet.to(
            Faction.to("faction")
          )
        )
      ).toArray();

      // Assert
      typesEqual<typeof singleResult, Spaceship[]>(true);

      deepStrictEqual(singleResult, [ bountyShip, deathStar ]);
    });
  });
});
