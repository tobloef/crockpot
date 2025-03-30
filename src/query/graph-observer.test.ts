import {
  describe,
  it,
  mock,
} from "node:test";
import {
  deepStrictEqual,
  strictEqual,
} from "node:assert";
import {
  Graph,
  GraphObserver,
  Node,
} from "../index.ts";

class NodeA extends Node {}

class NodeB extends Node {}

describe("GraphObserver", () => {
  it("Items added before an observer was created are not counted", () => {
    // Arrange
    const graph = new Graph();
    graph.addNode(new NodeA());
    graph.addNode(new NodeA());

    const input = NodeA;

    const observer = new GraphObserver(
      graph,
      input,
    );

    // Act
    const added = observer.added().toArray();

    // Assert
    strictEqual(added.length, 0);
  });

  it("Items added after an observer was created are yielded by the 'added' generator", () => {
    // Arrange
    const graph = new Graph();

    const input = NodeA;

    const observer = new GraphObserver(
      graph,
      input,
    );

    const node1 = new NodeA();
    const node2 = new NodeA();

    // Act
    graph.addNode(node1);
    graph.addNode(node2);

    const added = observer.added().toArray();

    // Assert
    deepStrictEqual(added, [node1, node2]);
  });

  it("Items added after an observer was created are notified to listeners", () => {
    // Arrange
    const graph = new Graph();

    const input = NodeA;

    const observer = new GraphObserver(
      graph,
      input,
    );

    const node1 = new NodeA();
    const node2 = new NodeA();

    const listener = mock.fn();
    observer.onAdded(listener);

    // Act
    graph.addNode(node1);
    graph.addNode(node2);

    // Assert
    const callArgs = listener.mock.calls.map(call => call.arguments);

    deepStrictEqual(callArgs, [[node1], [node2]]);
  });

  it("Items removed before an observer was created are not counted", () => {
    // Arrange
    const graph = new Graph();

    const node1 = new NodeA();
    const node2 = new NodeA();

    graph.addNode(node1);
    graph.addNode(node2);
    graph.removeNode(node1);

    const input = NodeA;

    const observer = new GraphObserver(
      graph,
      input,
    );

    // Act
    const removed = observer.removed().toArray();

    // Assert
    strictEqual(removed.length, 0);
  });

  it("Items removed after an observer was created are yielded by the 'removed' generator", () => {
    // Arrange
    const graph = new Graph();

    const node1 = new NodeA();
    const node2 = new NodeA();

    graph.addNode(node1);
    graph.addNode(node2);

    const input = NodeA;

    const observer = new GraphObserver(
      graph,
      input,
    );

    // Act
    graph.removeNode(node1);
    graph.removeNode(node2);

    const removed = observer.removed().toArray();

    // Assert
    deepStrictEqual(removed, [node1, node2]);
  });

  it("Items removed after an observer was created are notified to listeners", () => {
    // Arrange
    const graph = new Graph();

    const input = NodeA;

    const observer = new GraphObserver(
      graph,
      input,
    );

    const node1 = new NodeA();
    const node2 = new NodeA();

    graph.addNode(node1);
    graph.addNode(node2);

    const listener = mock.fn();
    observer.onRemoved(listener);

    // Act
    graph.removeNode(node1);
    graph.removeNode(node2);

    // Assert
    const callArgs = listener.mock.calls.map(call => call.arguments);

    deepStrictEqual(callArgs, [[node1], [node2]]);
  });

  it("Items not included in the query are not counted", () => {
    // Arrange
    const graph = new Graph();

    const node1 = new NodeA();
    const node2 = new NodeB();

    const input = NodeA;

    const observer = new GraphObserver(
      graph,
      input,
    );

    // Act
    graph.addNode(node1);
    graph.addNode(node2);
    graph.removeNode(node1);
    graph.removeNode(node2);

    const added = observer.added().toArray();
    const removed = observer.removed().toArray();

    // Assert
    deepStrictEqual(added, [node1]);
    deepStrictEqual(removed, [node1]);
  });

  it("Less specific nodes are not counted", () => {
    // Arrange
    const graph = new Graph();

    const node1 = new Node();

    const input = NodeA;

    const observer = new GraphObserver(
      graph,
      input,
    );

    // Act
    graph.addNode(node1);
    graph.removeNode(node1);

    const added = observer.added().toArray();
    const removed = observer.removed().toArray();

    // Assert
    deepStrictEqual(added, []);
    deepStrictEqual(removed, []);
  });

  it("More specific nodes are counted", () => {
    // Arrange
    const graph = new Graph();

    const node1 = new NodeA();

    const input = Node;

    const observer = new GraphObserver(
      graph,
      input,
    );

    // Act
    graph.addNode(node1);
    graph.removeNode(node1);

    const added = observer.added().toArray();
    const removed = observer.removed().toArray();

    // Assert
    deepStrictEqual(added, [node1]);
    deepStrictEqual(removed, [node1]);
  });
});
