import { Edge } from "./edge.ts";
import type { Node } from "./node.ts";
import { NotImplementedError } from "./utils/errors/not-implemented-error.ts";
import type {
  ArrayQueryInput,
  ObjectQueryInput,
  QueryInput,
  QueryInputItem,
  QueryOutput,
  QueryOutputItem,
} from "./query.types.ts";
import { query } from "./query.ts";

export class Graph {
  addNode(node: Node): this {
    throw new NotImplementedError(); // TODO
  }

  addEdge(input: WorldEdgeInput): this {
    throw new NotImplementedError(); // TODO
  }

  query<Input extends QueryInputItem>(input: Input): QueryOutput<Input>;

  query<Input extends ArrayQueryInput>(input: [...Input]): QueryOutput<Input>;

  query<Input extends ObjectQueryInput>(input: Input): Generator<(
    // Return type duplicated from ObjectQueryOutput to make type hints show up correctly
    // If ObjectQueryOutput is used directly, for some reason it shows up as:
    // Generator<ObjectQueryOutput<{ Transform: typeof Transform }, { Transform: typeof Transform }>, any, any>
    { [K in keyof Input]: QueryOutputItem<Input[K], Input> }
  )>;

  query<Input extends QueryInput>(input: Input): QueryOutput<Input> {
    return query(input);
  }
}

export type WorldEdgeInput = {
  to: Node;
  from: Node;
  edge?: Edge;
};