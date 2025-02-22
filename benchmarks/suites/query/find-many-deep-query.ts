import { sleep } from "../../../src/utils/sleep.ts";
import seedrandom from "seedrandom";

const importPath = process.argv[2]!;
const iterations = Number.parseInt(process.argv[3] ?? "1");
const seed = process.argv[4];

const { Graph, Node } = await import(importPath);

const PARENT_NODES = 1;
const LAYERS = 4;

const rng = seedrandom(seed);

const graph = new Graph();

const nodeClassDefinitions = Array.from(
  { length: LAYERS },
  () => class N extends Node {}
);

for (let i = 0; i < PARENT_NODES; i++) {
  let prevNode = graph.addNode(new Node());
  for (let j = 0; j < LAYERS; j++) {
    const ChildNode = nodeClassDefinitions[j]!;
    const newNode = new ChildNode();
    prevNode.addEdge({ to: newNode });
    prevNode = newNode;
  }
}

let queryItem;

for (const NodeClass of nodeClassDefinitions.toReversed()) {
  if (!queryItem) {
    queryItem = NodeClass.to();
  } else {
    queryItem = NodeClass.to(queryItem);
  }
}

for (let i = 0; i < iterations; i++) {
  const result = graph.query(queryItem!).toArray();

  console.log(`Found ${result.length?.toLocaleString()} nodes.`);
}