export function setup({
  crockpot,
  rng,
}: any) {
  const NODES = 1_000_000;

  const { Graph, Node } = crockpot;

  class NodeToFind extends Node {}

  const graph = new Graph();

  for (let i = 0; i < NODES/2 - 1; i++) {
    graph.addNode(new Node());
  }

  graph.addNode(new NodeToFind());

  for (let i = 0; i < NODES/2; i++) {
    graph.addNode(new Node());
  }

  return { graph, NodeToFind };
}

export function run(props: ReturnType<typeof setup>) {
  const { graph, NodeToFind } = props;

  const results = graph.query(NodeToFind);

  let checksum = 0;

  for (const node of results) {
    checksum += node.id.length;
  }

  return checksum;
}

