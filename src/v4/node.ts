import type { Edge } from "./edge.ts";

export class Node {
  addEdge(input: NodeEdgeInput): this {
    // TODO
    return this;
  }
}

export type NodeEdgeInput = (
  | { to: Node, edge?: Edge }
  | { from: Node, edge?: Edge }
  )