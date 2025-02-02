import { describe, it } from "node:test";
import { deepStrictEqual, throws } from "node:assert";
import { Graph } from "../graph.ts";
import { Node } from "../node/node.ts";
import { Edge } from "../edge/edge.ts";
import { typesEqual } from "../utils/type-assertion.ts";
import { ReferenceMismatchError } from "./errors/reference-mismatch-error.ts";

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
    const arrayResult = graph.query([ NodeA, EdgeA ]).toArray();
    const objectResult = graph.query({ NodeA, EdgeA }).toArray();

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
    const singleResult = graph.query(Node.with(Edge)).toArray();
    const arrayResult = graph.query([ Node.with(Edge) ]).toArray();
    const objectResult = graph.query({ Node: Node.with(Edge) }).toArray();

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
    const singleResult = graph.query(Node.with(Edge.to(Node))).toArray();
    const arrayResult = graph.query([ Node.with(Edge.to(Node)) ]).toArray();
    const objectResult = graph.query({ Node: Node.with(Edge.to(Node)) }).toArray();

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
    const singleResult = graph.query(Node.with(EdgeA.to(Node))).toArray();
    const arrayResult = graph.query([ Node.with(EdgeA.to(Node)) ]).toArray();
    const objectResult = graph.query({ Node: Node.with(EdgeA.to(Node)) }).toArray();

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
    const singleResult = graph.query(Node.with(Edge.to(Node))).toArray();
    const arrayResult = graph.query([ Node.with(Edge.to(Node)) ]).toArray();
    const objectResult = graph.query({ Node: Node.with(Edge.to(Node)) }).toArray();

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
    const singleResult = graph.query(Node.with(Edge.from(Node))).toArray();
    const arrayResult = graph.query([ Node.with(Edge.from(Node)) ]).toArray();
    const objectResult = graph.query({ Node: Node.with(Edge.from(Node)) }).toArray();

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
    const singleResult = graph.query(Node.with(Edge.to(Node))).toArray();
    const arrayResult = graph.query([ Node.with(Edge.to(Node)) ]).toArray();
    const objectResult = graph.query({ Node: Node.with(Edge.to(Node)) }).toArray();

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
    const singleResult = graph.query(Node.with(Edge.fromOrTo(Node))).toArray();
    const arrayResult = graph.query([ Node.with(Edge.fromOrTo(Node)) ]).toArray();
    const objectResult = graph.query({ Node: Node.with(Edge.fromOrTo(Node)) }).toArray();

    // Assert
    typesEqual<typeof singleResult, Node[]>(true);
    typesEqual<typeof arrayResult, [ Node ][]>(true);
    typesEqual<typeof objectResult, { Node: Node }[]>(true);

    deepStrictEqual(singleResult, [ nodeA, nodeB ]);
    deepStrictEqual(arrayResult, [ [ nodeA ], [ nodeB ] ]);
    deepStrictEqual(objectResult, [ { Node: nodeA }, { Node: nodeB } ]);
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
    const singleResult = graph.query(Node.to(Node)).toArray();
    const arrayResult = graph.query([ Node.to(Node) ]).toArray();
    const objectResult = graph.query({ Node: Node.to(Node) }).toArray();

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
    const singleResult = graph.query(Node.from(Node)).toArray();
    const arrayResult = graph.query([ Node.from(Node) ]).toArray();
    const objectResult = graph.query({ Node: Node.from(Node) }).toArray();

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
    const singleResult = graph.query(Node.fromOrTo(Node)).toArray();
    const arrayResult = graph.query([ Node.fromOrTo(Node) ]).toArray();
    const objectResult = graph.query({ Node: Node.fromOrTo(Node) }).toArray();

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
    const singleResult = graph.query(Node.to(NodeB)).toArray();
    const arrayResult = graph.query([ Node.to(NodeB) ]).toArray();
    const objectResult = graph.query({ Node: Node.to(NodeB) }).toArray();

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
    const singleResult = graph.query(Node.from(NodeA)).toArray();
    const arrayResult = graph.query([ Node.from(NodeA) ]).toArray();
    const objectResult = graph.query({ Node: Node.from(NodeA) }).toArray();

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
    const singleResult = graph.query(Node.fromOrTo(NodeB)).toArray();
    const arrayResult = graph.query([ Node.fromOrTo(NodeB) ]).toArray();
    const objectResult = graph.query({ Node: Node.fromOrTo(NodeB) }).toArray();

    // Assert
    typesEqual<typeof singleResult, Node[]>(true);
    typesEqual<typeof arrayResult, [ Node ][]>(true);
    typesEqual<typeof objectResult, { Node: Node }[]>(true);

    deepStrictEqual(singleResult, [ node2, node4 ]);
    deepStrictEqual(arrayResult, [ [ node2 ], [ node4 ] ]);
    deepStrictEqual(objectResult, [ { Node: node2 }, { Node: node4 } ]);
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
    const singleResult = graph.query(Node.fromOrTo(NodeA)).toArray();
    const arrayResult = graph.query([ Node.fromOrTo(NodeA) ]).toArray();
    const objectResult = graph.query({ Node: Node.fromOrTo(NodeA) }).toArray();

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
    const singleResult = graph.query(Node.as("ref")).toArray();
    const arrayResult = graph.query([ Node.as("ref") ]).toArray();
    const objectResult = graph.query({ Node: Node.as("ref") }).toArray();

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
    const singleResult = graph.query(Edge.as("ref")).toArray();
    const arrayResult = graph.query([ Edge.as("ref") ]).toArray();
    const objectResult = graph.query({ Edge: Edge.as("ref") }).toArray();

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
    const arrayResult = graph.query([
      Node.as("ref"),
      Node.with(Edge.to("ref"))
    ]).toArray();
    const objectResult = graph.query({
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
    const arrayResult = graph.query([
      Node.as("ref"),
      Node.with(Edge.from("ref"))
    ]).toArray();
    const objectResult = graph.query({
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
    const arrayResult = graph.query([
      Node.as("ref"),
      Node.to("ref")
    ]).toArray();
    const objectResult = graph.query({
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
    const arrayResult = graph.query([
      Node.as("ref"),
      Node.from("ref")
    ]).toArray();
    const objectResult = graph.query({
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
    const arrayResult = graph.query([
      NodeA.as("ref"),
      Node.to("ref")
    ]).toArray();
    const objectResult = graph.query({
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
    const arrayResult = graph.query([
      NodeB.as("ref"),
      Node.from("ref")
    ]).toArray();
    const objectResult = graph.query({
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
    const arrayQuery = () => graph.query([
      NodeA.as("ref"),
      NodeB.as("ref")
    ]).toArray();
    const objectQuery = () => graph.query({
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
    const arrayQuery = () => graph.query([
      EdgeA.as("ref"),
      EdgeB.as("ref")
    ]).toArray();
    const objectQuery = () => graph.query({
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
    const arrayResult = graph.query([
      ChildOfNodeA.as("ref"),
      NodeA.as("ref"),
    ]).toArray();
    const objectResult = graph.query({
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
    const arrayResult = graph.query([
      ChildOfEdgeA.as("ref"),
      EdgeA.as("ref"),
    ]).toArray();
    const objectResult = graph.query({
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
    const arrayQuery = () => graph.query([
      Node.as("ref"),
      Edge.as("ref"),
    ]).toArray();
    const objectQuery = () => graph.query({
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
});

// TODO: Negative tests, such as a reference with multiple types
// TODO: String items
// TODO: Multiple implicit from/to/fromOrTo/with items
// TODO: Self-referencing nodes only
// TODO: Instances