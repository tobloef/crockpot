import { Graph } from "./graph.ts";
import { GraphNode } from "./node.ts";

class SomeNode extends GraphNode {
  #brand = "SomeNode" as const;
}

class OtherNode extends GraphNode {
  #brand = "OtherNode" as const;
}

class SomeEdge extends GraphEdge {
  #brand = "SomeEdge" as const;
}

class OtherEdge extends GraphEdge {
  #brand = "OtherEdge" as const;
}

const graph = new Graph();
const result = graph.query({
  a: GraphNode,
  b: ["a", GraphEdge, "c.a"],
  c: {
    a: SomeNode,
    b: ["c.a", SomeEdge, "c.c.a"],
    c: {
      a: OtherNode,
      b: ["a", OtherEdge, "c.a"],
    }
  },
})
