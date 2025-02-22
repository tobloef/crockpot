
export function setup({
  crockpot,
  rng,
}: any) {
  const PARENT_NODES = 1000;
  const LAYERS = 20;

  const { Graph, Node } = crockpot;

  const graph = new Graph();

  const nodeClassDefinitions = Array.from(
    { length: LAYERS },
    () => class N extends Node {}
  );

  for (let i = 0; i < PARENT_NODES; i++) {
    let prevNode = graph.addNode(new Node());
    for (let j = 0; j < LAYERS; j++) {
      const ChildNode = nodeClassDefinitions[j]!;
      const newNode = new ChildNode();
      prevNode.addEdge({ to: newNode });
      prevNode = newNode;
    }
  }

  let queryItem;

  for (const NodeClass of nodeClassDefinitions.toReversed()) {
    if (!queryItem) {
      queryItem = NodeClass.to();
    } else {
      queryItem = NodeClass.to(queryItem);
    }
  }

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

