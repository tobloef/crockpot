import { beforeEach, describe, it } from "node:test";
import { deepStrictEqual } from "node:assert";
import { Edge, Node, query, World } from "./graph";
import { assertTypesEqual } from "../utils/type-assertions";

beforeEach(() => {
  Node.defaultWorld = new World();
});

describe("query", () => {
  it("Finds nothing when input is empty", () => {
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
    const expectedObject: ExpectedObjectType[] = [
      { node: node1 },
      { node: node2 },
    ];

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
    const expectedObject: ExpectedObjectType[] = [
      { edge: edge1 },
      { edge: edge2 },
    ];

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
    const expectedObject: ExpectedObjectType[] = [
      { node: node1 },
      { node: node2 },
    ];

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

  it("Find specific type of nodes", () => {
    // Arrange
    class TestNode1 extends Node {
      value: number = 123;
    }

    class TestNode2 extends Node {}

    const node1 = new Node();
    const node2 = new TestNode1();
    const node3 = new TestNode2();

    type ExpectedArrayType = [TestNode1];
    const expectedArray: ExpectedArrayType[] = [
      [node2],
    ];

    type ExpectedObjectType = { node: TestNode1 };
    const expectedObject: ExpectedObjectType[] = [
      { node: node2 },
    ];

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
});