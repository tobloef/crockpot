import { sleep } from "../../../src/utils/sleep.ts";
import seedrandom from "seedrandom";

const importPath = process.argv[2]!;
const iterations = Number.parseInt(process.argv[3] ?? "1");
const seed = process.argv[4];

const { Graph, Node } = await import(importPath);

class NodeToFind extends Node {}

const NODES = 100_000;

const rng = seedrandom(seed);

const graph = new Graph();

for (let i = 0; i < NODES; i++) {
  graph.addNode(new NodeToFind());
}

for (let i = 0; i < iterations; i++) {
  const result = graph.query(NodeToFind).toArray();

  console.log(`Found ${result.length.toLocaleString()} nodes.`);
}