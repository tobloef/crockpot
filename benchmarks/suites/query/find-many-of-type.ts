import { Graph, Node } from "@tobloef/crockpot";

const NODES = 100_000;

class NoToFind extends Node {}

const graph = new Graph();

for (let i = 0; i < NODES; i++) {
  graph.addNode(new NoToFind());
}

const result = graph.query(NoToFind).toArray();

console.log(`Found ${result.length.toLocaleString()} nodes.`);