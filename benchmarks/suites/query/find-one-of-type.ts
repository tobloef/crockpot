import { Graph, Node } from "@tobloef/crockpot-local";

const NODES = 100_000;

class NodeToFind extends Node {}

const graph = new Graph();

for (let i = 0; i < NODES - 1; i++) {
  graph.addNode(new Node());
}

graph.addNode(new NodeToFind());

let result = graph.query(Node);

if (result.toArray !== undefined) {
  result = result.toArray();
}

console.log(`Found ${result.length.toLocaleString()} nodes.`);