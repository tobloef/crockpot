import { Graph, Node } from "../../../src/index.ts";
import { sleep } from "../../../src/utils/sleep.ts";

const PARENT_NODES = 1;
const CHILD_NODES = 4;

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

await sleep(100);

let result = graph.query(
  Node.to(...nodeClassDefinitions)
).toArray();

console.log(`Found ${result.length?.toLocaleString()} nodes.`);