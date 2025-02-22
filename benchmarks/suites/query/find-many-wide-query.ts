import { sleep } from "../../../src/utils/sleep.ts";
import seedrandom from "seedrandom";

const importPath = process.argv[2]!;
const iterations = Number.parseInt(process.argv[3] ?? "1");
const seed = process.argv[4];

const { Graph, Node } = await import(importPath);

const PARENT_NODES = 1;
const CHILD_NODES = 4;

const rng = seedrandom(seed);

const graph = new Graph();

const nodeClassDefinitions = Array.from(
  { length: CHILD_NODES },
  () => class N extends Node {}
);

for (let i = 0; i < PARENT_NODES; i++) {
  const parentNode = graph.addNode(new Node());
  for (let j = 0; j < CHILD_NODES; j++) {
    const ChildNode = nodeClassDefinitions[j]!;
    parentNode.addEdge({ to: new ChildNode() });
  }
}

for (let i = 0; i < iterations; i++) {
  let result = graph.query(
    Node.to(...nodeClassDefinitions)
  ).toArray();

  console.log(`Found ${result.length?.toLocaleString()} nodes.`);
}