import { Graph, Node } from "@tobloef/crockpot";

const NODES = 100_000;

class NoToFind extends Node {}

const graph = new Graph();

for (let i = 0; i < NODES - 1; i++) {
  graph.addNode(new Node());
}

graph.addNode(new NoToFind());

const result = graph.query(Node).toArray();

console.log(`Found ${result.length.toLocaleString()} nodes.`);