import { Graph, Node } from "../../../src/index.ts";
import { sleep } from "../../../src/utils/sleep.ts";

const NODES = 100_000;

class NodeToFind extends Node {}

const graph = new Graph();

for (let i = 0; i < NODES; i++) {
  graph.addNode(new NodeToFind());
}

await sleep(100);

let result = graph.query(NodeToFind).toArray();

console.log(`Found ${result.length.toLocaleString()} nodes.`);