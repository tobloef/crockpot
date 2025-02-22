export function setup({
  crockpot,
  rng,
}: any) {
  const PARENT_NODES = 200;
  const CHILD_NODES = 20;

  const { Graph, Node } = crockpot;

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

  const queryItem = Node.to(...nodeClassDefinitions);

  return { graph, queryItem };
}

export function run(props: ReturnType<typeof setup>) {
  const { graph, queryItem } = props;

  const results = graph.query(queryItem);

  let checksum = 0;

  for (const node of results) {
    checksum += node.id.length;
  }

  return checksum;
}

