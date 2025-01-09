import { Edge } from "./edge.ts";
import type { Node } from "./node.ts";
import { NotImplementedError } from "./utils/errors/not-implemented-error.ts";
import type { QueryInput, QueryOutput } from "./query.ts";

export class Graph {
  addNode(node: Node): this {
    throw new NotImplementedError(); // TODO
  }

  addEdge(input: WorldEdgeInput): this {
    throw new NotImplementedError(); // TODO
  }

  query<Input extends QueryInput>(
    input: Input
  ): QueryOutput<Input> {
    throw new NotImplementedError(); // TODO
  }
}

export type WorldEdgeInput = {
  to: Node;
  from: Node;
  edge?: Edge;
};