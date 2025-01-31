import { describe, it } from "node:test";
import { strictEqual, ok, deepStrictEqual } from "node:assert";
import { type AddEdgeInput, Graph } from "./graph.ts";
import { Node } from "./node.ts";
import { Edge } from "./edge.ts";

class TestNode extends Node {
  value: number;

  constructor(value: number) {
    super();
    this.value = value;
  }
}

class TestEdge extends Edge {
  value: number;

  constructor(value: number) {
    super();
    this.value = value;
  }
}

describe("addNode", () => {
  it("Node is added to allNodes index", () => {
    // Arrange
    const graph = new Graph();
    const nodeToAdd = new TestNode(1);

    // Act
    graph.addNode(nodeToAdd);

    // Assert
    ok(graph.indices.allNodes.has(nodeToAdd));
  });

  it("Node is added to nodesByType index", () => {
    // Arrange
    const graph = new Graph();
    const nodeToAdd = new TestNode(1);

    // Act
    graph.addNode(nodeToAdd);

    // Assert
    ok(graph.indices.nodesByType.get(TestNode)?.has(nodeToAdd));
  });

  it("Returns the added node", () => {
    // Arrange
    const graph = new Graph();
    const nodeToAdd = new TestNode(1);

    // Act
    const addedNode: TestNode = graph.addNode(nodeToAdd);

    // Assert
    strictEqual(addedNode, nodeToAdd);
  });

  it("Does not add existing node", () => {
    // Arrange
    const graph = new Graph();
    const nodeToAdd = new TestNode(1);

    // Act
    graph.addNode(nodeToAdd);
    graph.addNode(nodeToAdd);

    // Assert
    strictEqual(graph.indices.allNodes.size, 1);
  });

  it("Sets the node's graph to the graph", () => {
    // Arrange
    const graph = new Graph();
    const nodeToAdd = new TestNode(1);

    // Act
    graph.addNode(nodeToAdd);

    // Assert
    strictEqual(nodeToAdd.graph, graph);
  });

  it("Adds node's edges to the graph", (test) => {
    // Arrange
    const graph = new Graph();

    const node1 = new TestNode(1);
    const node2 = new TestNode(2);
    const node3 = new TestNode(3);
    const node4 = new TestNode(4);

    const edge1 = node1.addEdge({
      from: node2,
    });
    const edge2 = node1.addEdge({
      to: node3,
    });
    const edge3 = node1.addEdge({
      to: node4,
      edge: new TestEdge(123),
    });

    const addEdge = test.mock.method(graph, "addEdge");

    // Act
    graph.addNode(node1);

    // Assert
    const uniqueAddEdgeCalls = Array.from(new Set(
      addEdge.mock.calls.map((c) => JSON.stringify(c.arguments))
    ));

    const expectedAddEdgeCalls = [
      JSON.stringify([{ edge: edge2, from: node1, to: node3 }]),
      JSON.stringify([{ edge: edge3, from: node1, to: node4 }]),
      JSON.stringify([{ edge: edge1, from: node2, to: node1 }]),
    ];

    deepStrictEqual(uniqueAddEdgeCalls, expectedAddEdgeCalls);
  });
});