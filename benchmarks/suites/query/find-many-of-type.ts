import { Graph, Node } from "@tobloef/crockpot-local";

const NODES = 100_000;

class NodeToFind extends Node {}

const graph = new Graph();

for (let i = 0; i < NODES; i++) {
  graph.addNode(new NodeToFind());
}

let result = graph.query(NodeToFind);

if (result.toArray !== undefined) {
  result = result.toArray();
}

console.log(`Found ${result.length.toLocaleString()} nodes.`);