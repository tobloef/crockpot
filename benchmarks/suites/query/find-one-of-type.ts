import { Graph, Node } from "../../../src/index.ts";
import { sleep } from "../../../src/utils/sleep.ts";

const NODES = 100_000;

class NodeToFind extends Node {}

const graph = new Graph();

for (let i = 0; i < NODES - 1; i++) {
  graph.addNode(new Node());
}

graph.addNode(new NodeToFind());

await sleep(1000)

let result = graph.query(Node).toArray();

console.log(`Found ${result.length.toLocaleString()} nodes.`);