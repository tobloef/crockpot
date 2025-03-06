import { Graph, Node, Edge } from "@tobloef/crockpot-local";
import { sleep } from "../src/utils/sleep.ts";

const graph = new Graph();

const nodes1 = Array.from({ length: 100 }, () => graph.addNode(new Node()));
const nodes2 = Array.from({ length: 100 }, () => graph.addNode(new Node()));
const edges = nodes1.map((node1, i) => node1.addEdge({ to: nodes2[i] }));

let id = "";

await sleep(100);

const start = performance.now();

for (let i = 0; i < nodes1.length; i++) {
  const node = nodes1[i];
  //id += node.edges.from.values().next().value.nodes.to.id;   // 0.04 ms
  //id += graph.query(Node.from(node)).run().next().value.id;  // 4.00 ms
  //id += node.getOneRelated(Node, "from").id;                 // 0.13 ms
}

const end = performance.now();

await sleep(100);

console.log(end - start, id.length);