import { describe, it } from "node:test";
import { deepStrictEqual, ok, strictEqual } from "node:assert";
import { Graph } from "./graph.ts";
import { Node } from "./node/node.ts";
import { Edge } from "./edge/edge.ts";

class TestNode extends Node {
  value: number;

  constructor(value: number) {
    super();
    this.value = value;
  }
}

class ChildNode extends TestNode {}

class OtherNode extends Node {}

class TestEdge extends Edge {
  value: number;

  constructor(value: number) {
    super();
    this.value = value;
  }
}

class ChildEdge extends TestEdge {}

describe("Graph", () => {
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

    it("Node is added to nodesByType index of parent class", () => {
      // Arrange
      const graph = new Graph();
      const nodeToAdd = new ChildNode(1);

      // Act
      graph.addNode(nodeToAdd);

      // Assert
      ok(graph.indices.nodesByType.get(TestNode)?.has(nodeToAdd));
      ok(graph.indices.nodesByType.get(Node)?.has(nodeToAdd));
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

    it("Node is removed from its previous graph", (test) => {
      // Arrange
      const graph1 = new Graph();
      const graph2 = new Graph();

      const node = new TestNode(1);
      graph1.addNode(node);

      const removeNode = test.mock.method(graph1, "removeNode");

      // Act
      graph2.addNode(node);

      // Assert
      deepStrictEqual(removeNode.mock.calls.length, 1);
      deepStrictEqual(removeNode.mock.calls[0]!.arguments, [node]);
      deepStrictEqual(removeNode.mock.calls[0]!.this, graph1);
    });
  });

  describe("addNodes", () => {
    it("Adds multiple nodes", (test) => {
      // Arrange
      const graph = new Graph();
      const node1 = new TestNode(1);
      const node2 = new TestNode(2);
      const node3 = new TestNode(3);

      const addNode = test.mock.method(graph, "addNode");

      // Act
      graph.addNodes([node1, node2, node3]);

      // Assert
      const addNodeCallArgs = addNode.mock.calls.map((c) => c.arguments);
      deepStrictEqual(addNodeCallArgs, [[node1], [node2], [node3]]);
    });

    it("Returns added nodes", () => {
      // Arrange
      const graph = new Graph();
      const node1 = new TestNode(1);
      const node2 = new TestNode(2);
      const node3 = new TestNode(3);

      // Act
      const addedNodes = graph.addNodes([node1, node2, node3]);

      // Assert
      deepStrictEqual(addedNodes, [node1, node2, node3]);
    });
  });

  describe("removeNode", () => {
    it("Node is removed from the allNodes index", () => {
      // Arrange
      const graph = new Graph();
      const node = new TestNode(1);
      graph.addNode(node);

      // Act
      graph.removeNode(node);

      // Assert
      const hasNode = graph.indices.allNodes.has(node);
      strictEqual(hasNode, false);
    });

    it("Node is removed from the nodesByType index", () => {
      // Arrange
      const graph = new Graph();
      const node = new TestNode(1);
      graph.addNode(node);

      // Act
      graph.removeNode(node);

      // Assert
      const hasNode = graph.indices.nodesByType.get(TestNode)?.has(node);
      strictEqual(hasNode, false);
    });

    it("Node is removed from the nodesByType index of parent class", () => {
      // Arrange
      const graph = new Graph();
      const node = new ChildNode(1);
      graph.addNode(node);

      // Act
      graph.removeNode(node);

      // Assert
      strictEqual(graph.indices.nodesByType.get(Node)?.has(node), false);
      strictEqual(graph.indices.nodesByType.get(TestNode)?.has(node), false);
    });

    it("Node's edges are removed from the edgesByNode index", () => {
      // Arrange
      const graph = new Graph();
      const node = new TestNode(1);
      graph.addNode(node);

      node.addEdge({
        from: new TestNode(2),
      });
      node.addEdge({
        to: new TestNode(3),
      });

      // Act
      graph.removeNode(node);

      // Assert
      const edgesByNode = graph.indices.edgesByNode.get(node);
      strictEqual(edgesByNode, undefined);
    });

    it("Node's edges are removed", (test) => {
      // Arrange
      const graph = new Graph();
      const node = new TestNode(1);
      graph.addNode(node);

      const edge1 = node.addEdge({
        from: new TestNode(2),
      });
      const edge2 = node.addEdge({
        to: new TestNode(3),
      });

      const removeEdge = test.mock.method(graph, "removeEdge");

      // Act
      graph.removeNode(node);

      // Assert
      const removeEdgeCallArgs = removeEdge.mock.calls.map((c) => c.arguments);
      deepStrictEqual(removeEdgeCallArgs, [[edge2], [edge1]]);
    });
  });

  describe("removeNodes", () => {
    it("Removes multiple nodes", (test) => {
      // Arrange
      const graph = new Graph();
      const node1 = new TestNode(1);
      const node2 = new TestNode(2);
      const node3 = new TestNode(3);

      graph.addNodes([node1, node2, node3]);

      const removeNode = test.mock.method(graph, "removeNode");

      // Act
      graph.removeNodes([node1, node2, node3]);

      // Assert
      const removeNodeCallArgs = removeNode.mock.calls.map((c) => c.arguments);
      deepStrictEqual(removeNodeCallArgs, [[node1], [node2], [node3]]);
    });
  });

  describe("removeNodesByType", () => {
    it("Removes all nodes of a given type", (test) => {
      // Arrange
      const graph = new Graph();
      const node1 = new TestNode(1);
      const node2 = new TestNode(2);
      const node3 = new ChildNode(3);
      const otherNode = new OtherNode();

      graph.addNodes([node1, node2, node3, otherNode]);

      const removeNode = test.mock.method(graph, "removeNode");

      // Act
      graph.removeNodesByType(TestNode);

      // Assert
      const removeNodeCallArgs = removeNode.mock.calls.map((c) => c.arguments);
      deepStrictEqual(removeNodeCallArgs, [[node1], [node2], [node3]]);
    });
  });

  describe("addEdge", () => {
    it("Edge is added to allEdges index", () => {
      // Arrange
      const graph = new Graph();
      const edge = new TestEdge(1);

      // Act
      graph.addEdge({
        edge,
        from: new TestNode(1),
        to: new TestNode(2),
      });

      // Assert
      ok(graph.indices.allEdges.has(edge));
    });

    it("Edge is added to edgesByType index", () => {
      // Arrange
      const graph = new Graph();
      const edge = new TestEdge(1);

      // Act
      graph.addEdge({
        edge,
        from: new TestNode(1),
        to: new TestNode(2),
      });

      // Assert
      ok(graph.indices.edgesByType.get(TestEdge)?.has(edge));
    });

    it("Edge is added to edgesByType index of parent class", () => {
      // Arrange
      const graph = new Graph();
      const edge = new ChildEdge(1);

      // Act
      graph.addEdge({
        edge,
        from: new TestNode(1),
        to: new TestNode(2),
      });

      // Assert
      ok(graph.indices.edgesByType.get(Edge)?.has(edge));
      ok(graph.indices.edgesByType.get(TestEdge)?.has(edge));
    });

    it("Returns the inserted edge", () => {
      // Arrange
      const graph = new Graph();
      const edge = new TestEdge(1);

      // Act
      const insertedEdge = graph.addEdge({
        edge,
        from: new TestNode(1),
        to: new TestNode(2),
      });

      // Assert
      strictEqual(insertedEdge, edge);
    });

    it("Does not add existing edge", () => {
      // Arrange
      const graph = new Graph();
      const edge = new TestEdge(1);

      // Act
      graph.addEdge({
        edge,
        from: new TestNode(1),
        to: new TestNode(2),
      });

      graph.addEdge({
        edge,
        from: new TestNode(1),
        to: new TestNode(2),
      });

      // Assert
      strictEqual(graph.indices.allEdges.size, 1);
    });

    it("Edge's nodes are added to nodesByEdge index", () => {
      // Arrange
      const graph = new Graph();
      const fromNode = new TestNode(1);
      const toNode = new TestNode(2);
      const edge = new TestEdge(1);

      // Act
      graph.addEdge({
        edge,
        from: fromNode,
        to: toNode,
      });

      // Assert
      const nodesByEdge = graph.indices.nodesByEdge.get(edge);
      deepStrictEqual(nodesByEdge, { from: fromNode, to: toNode });
    });

    it("Sets the edge's graph to the graph", () => {
      // Arrange
      const graph = new Graph();
      const edge = new TestEdge(1);

      // Act
      graph.addEdge({
        edge,
        from: new TestNode(1),
        to: new TestNode(2),
      });

      // Assert
      strictEqual(edge.graph, graph);
    });

    it("Add edge's nodes to the graph", (test) => {
      // Arrange
      const graph = new Graph();
      const fromNode = new TestNode(1);
      const toNode = new TestNode(2);
      const edge = new TestEdge(1);

      const addNode = test.mock.method(graph, "addNode");

      // Act
      graph.addEdge({
        edge,
        from: fromNode,
        to: toNode,
      });

      // Assert
      const addNodeCallArgs = addNode.mock.calls.map((c) => c.arguments);
      deepStrictEqual(addNodeCallArgs, [[fromNode], [toNode]]);
    });

    it("Remove edge from its previous graph", (test) => {
      // Arrange
      const graph1 = new Graph();
      const graph2 = new Graph();

      const edge = new TestEdge(1);
      graph1.addEdge({
        edge,
        from: new TestNode(1),
        to: new TestNode(2),
      });

      const removeEdge = test.mock.method(graph1, "removeEdge");

      // Act
      graph2.addEdge({
        edge,
        from: new TestNode(1),
        to: new TestNode(2),
      });

      // Assert
      deepStrictEqual(removeEdge.mock.calls.length, 1);
      deepStrictEqual(removeEdge.mock.calls[0]!.arguments, [edge]);
      deepStrictEqual(removeEdge.mock.calls[0]!.this, graph1);
    });
  });

  describe("removeEdge", () => {
    it("Edge is removed from the allEdges index", () => {
      // Arrange
      const graph = new Graph();
      const edge = new TestEdge(1);
      graph.addEdge({
        edge,
        from: new TestNode(1),
        to: new TestNode(2),
      });

      // Act
      graph.removeEdge(edge);

      // Assert
      const hasEdge = graph.indices.allEdges.has(edge);
      strictEqual(hasEdge, false);
    });

    it("Edge is removed from the edgesByType index", () => {
      // Arrange
      const graph = new Graph();
      const edge = new TestEdge(1);
      graph.addEdge({
        edge,
        from: new TestNode(1),
        to: new TestNode(2),
      });

      // Act
      graph.removeEdge(edge);

      // Assert
      const hasEdge = graph.indices.edgesByType.get(TestEdge)?.has(edge);
      strictEqual(hasEdge, false);
    });

    it("Edge is removed from the edgesByType index of parent class", () => {
      // Arrange
      const graph = new Graph();
      const edge = new ChildEdge(1);
      graph.addEdge({
        edge,
        from: new TestNode(1),
        to: new TestNode(2),
      });

      // Act
      graph.removeEdge(edge);

      // Assert
      strictEqual(graph.indices.edgesByType.get(Edge)?.has(edge), false);
      strictEqual(graph.indices.edgesByType.get(TestEdge)?.has(edge), false);
    });

    it("Edge's nodes are removed from the nodesByEdge index", () => {
      // Arrange
      const graph = new Graph();
      const fromNode = new TestNode(1);
      const toNode = new TestNode(2);
      const edge = new TestEdge(1);
      graph.addEdge({
        edge,
        from: fromNode,
        to: toNode,
      });

      // Act
      graph.removeEdge(edge);

      // Assert
      const nodesByEdge = graph.indices.nodesByEdge.get(edge);
      strictEqual(nodesByEdge, undefined);
    });

    it("Edge is removed from edgesByNode indices", () => {
      // Arrange
      const graph = new Graph();
      const fromNode = new TestNode(1);
      const toNode = new TestNode(2);
      const edge = new TestEdge(1);
      graph.addEdge({
        edge,
        from: fromNode,
        to: toNode,
      });

      // Act
      graph.removeEdge(edge);

      // Assert
      const edgesByFromNode = graph.indices.edgesByNode.get(fromNode);
      const edgesByToNode = graph.indices.edgesByNode.get(toNode);

      strictEqual(edgesByFromNode?.from.has(edge), false);
      strictEqual(edgesByToNode?.to.has(edge), false);
    });
  });

  describe("removeEdges", () => {
    it("Removes multiple edges", (test) => {
      // Arrange
      const graph = new Graph();
      const edge1 = new TestEdge(1);
      const edge2 = new TestEdge(2);
      const edge3 = new TestEdge(3);

      const removeEdge = test.mock.method(graph, "removeEdge");

      // Act
      graph.removeEdges([edge1, edge2, edge3]);

      // Assert
      const removeEdgeCallArgs = removeEdge.mock.calls.map((c) => c.arguments);
      deepStrictEqual(removeEdgeCallArgs, [[edge1], [edge2], [edge3]]);
    });
  });

  describe("removeEdgesByNodes", () => {
    it("Remove edges between from node and to node", (test) => {
      // Arrange
      const graph = new Graph();
      const fromNode = new TestNode(1);
      const toNode = new TestNode(2);

      const edge1 = graph.addEdge({
        from: fromNode,
        to: toNode,
      });

      const edge2 = graph.addEdge({
        from: fromNode,
        to: toNode,
      });

      graph.addEdge({
        from: toNode,
        to: fromNode,
      });

      const removeEdge = test.mock.method(graph, "removeEdge");

      // Act
      graph.removeEdgesByNodes({
        from: fromNode,
        to: toNode,
      });

      // Assert
      const removeEdgeCallArgs = removeEdge.mock.calls.map((c) => c.arguments);
      deepStrictEqual(removeEdgeCallArgs, [[edge1], [edge2]]);
    });

    it("Remove edges from node", (test) => {
      // Arrange
      const graph = new Graph();
      const fromNode = new TestNode(1);
      const toNode = new TestNode(2);

      const edge1 = graph.addEdge({
        from: fromNode,
        to: toNode,
      });

      const edge2 = graph.addEdge({
        from: fromNode,
        to: toNode,
      });

      const edge3 = graph.addEdge({
        from: fromNode,
        to: new Node(),
      });

      graph.addEdge({
        from: toNode,
        to: fromNode,
      });

      const removeEdge = test.mock.method(graph, "removeEdge");

      // Act
      graph.removeEdgesByNodes({
        from: fromNode,
      });

      // Assert
      const removeEdgeCallArgs = removeEdge.mock.calls.map((c) => c.arguments);
      deepStrictEqual(removeEdgeCallArgs, [[edge1], [edge2], [edge3]]);
    });

    it("Remove edges to node", (test) => {
      // Arrange
      const graph = new Graph();
      const fromNode = new TestNode(1);
      const toNode = new TestNode(2);

      const edge1 = graph.addEdge({
        from: fromNode,
        to: toNode,
      });

      const edge2 = graph.addEdge({
        from: fromNode,
        to: toNode,
      });

      const edge3 = graph.addEdge({
        from: new Node(),
        to: toNode,
      });

      graph.addEdge({
        from: toNode,
        to: fromNode,
      });

      const removeEdge = test.mock.method(graph, "removeEdge");

      // Act
      graph.removeEdgesByNodes({
        to: toNode,
      });

      // Assert
      const removeEdgeCallArgs = removeEdge.mock.calls.map((c) => c.arguments);
      deepStrictEqual(removeEdgeCallArgs, [[edge1], [edge2], [edge3]]);
    });

    it("Remove edges from or to node", (test) => {
      // Arrange
      const graph = new Graph();
      const fromNode = new TestNode(1);
      const toNode = new TestNode(2);

      const edge1 = graph.addEdge({
        from: fromNode,
        to: toNode,
      });

      const edge2 = graph.addEdge({
        from: fromNode,
        to: toNode,
      });

      graph.addEdge({
        from: new Node(),
        to: toNode,
      });

      const edge4 = graph.addEdge({
        from: toNode,
        to: fromNode,
      });

      const removeEdge = test.mock.method(graph, "removeEdge");

      // Act
      graph.removeEdgesByNodes({
        fromOrTo: fromNode,
      });

      // Assert
      const removeEdgeCallArgs = removeEdge.mock.calls.map((c) => c.arguments);
      deepStrictEqual(removeEdgeCallArgs, [[edge1], [edge2], [edge4]]);
    });

    it("Remove edges of a specific type", (test) => {
      // Arrange
      const graph = new Graph();
      const fromNode = new TestNode(1);
      const toNode = new TestNode(2);

      const edge1 = graph.addEdge({
        from: fromNode,
        to: toNode,
        edge: new TestEdge(1),
      });

      graph.addEdge({
        from: fromNode,
        to: toNode,
      });

      graph.addEdge({
        from: new Node(),
        to: toNode,
        edge: new TestEdge(2),
      });

      const edge4 = graph.addEdge({
        from: toNode,
        to: fromNode,
        edge: new TestEdge(3),
      });

      const removeEdge = test.mock.method(graph, "removeEdge");

      // Act
      graph.removeEdgesByNodes({
        type: TestEdge,
        fromOrTo: fromNode,
      });

      // Assert
      const removeEdgeCallArgs = removeEdge.mock.calls.map((c) => c.arguments);
      deepStrictEqual(removeEdgeCallArgs, [[edge1], [edge4]]);
    });
  });

  describe("removeEdgesByType", () => {
    it("Remove all edges of a specific type", (test) => {
      // Arrange
      const graph = new Graph();

      const edge1 = graph.addEdge({
        from: new Node(),
        to: new Node(),
        edge: new TestEdge(1),
      });

      const edge2 = graph.addEdge({
        from: new Node(),
        to: new Node(),
        edge: new ChildEdge(2),
      });

      graph.addEdge({
        from: new Node(),
        to: new Node(),
      });

      const removeEdge = test.mock.method(graph, "removeEdge");

      // Act
      graph.removeEdgesByType(TestEdge);

      // Assert
      const removeEdgeCallArgs = removeEdge.mock.calls.map((c) => c.arguments);
      deepStrictEqual(removeEdgeCallArgs, [[edge1], [edge2]]);
    });
  });
});