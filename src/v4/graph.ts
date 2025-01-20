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
import { writeable } from "./utils/writeable.ts";
import type { Class } from "./utils/class.ts";

// TODO: Rethink and refactor responsibility of which class really insert.
// TODO: Right now, things inserted on nodes/edges are not inserted on the graph.

export class Graph {
  nodes: Node[] = [];
  edges: Edge[] = [];

  query<Input extends QueryInputItem>(input: Input): Generator<QueryOutput<Input>>;

  query<Input extends ArrayQueryInput>(input: [...Input]): Generator<QueryOutput<Input>>;

  query<Input extends ObjectQueryInput>(input: Input): Generator<(
    // Return type duplicated from ObjectQueryOutput to make type hints show up correctly
    // If ObjectQueryOutput is used directly, for some reason it shows up as:
    // Generator<ObjectQueryOutput<{ Transform: typeof Transform }, { Transform: typeof Transform }>, any, any>
    { [K in keyof Input]: QueryOutputItem<Input[K], Input> }
    )>;

  query<Input extends QueryInput>(input: Input): Generator<QueryOutput<Input>> {
    return query(this, input);
  }

  addNode(node: Node): this {
    const transaction = this.#beginAddTransaction();

    this.#addNodeRecursively(node, transaction);

    this.#executeAddTransaction(transaction);

    return this;
  }

  removeNode(node: Node): this {
    this.nodes = this.nodes.filter((n) => n !== node);

    for (const edge of node.edges.from) {
      this.removeEdge(edge);
    }

    for (const edge of node.edges.to) {
      this.removeEdge(edge);
    }

    return this;
  }

  removeNodes(type: Class<Node>): this {
    const nodesToRemove = this.nodes.filter((node) => node instanceof type);

    for (const node of nodesToRemove) {
      this.removeNode(node);
    }

    return this;
  }

  addEdge(input: AddEdgeInput): this {
    const transaction = this.#beginAddTransaction();

    this.#addEdgeRecursively(input, transaction);

    return this;
  }

  removeEdge(input: Edge): this {
    this.edges = this.edges.filter((edge) => edge !== input);

    return this;
  }

  removeEdges(input: RemoveEdgesInput): this {
    const edgesToRemove = this.edges.filter((edge) => (
      (input.from === undefined || edge.nodes.from === input.from) &&
      (input.to === undefined || edge.nodes.to === input.to) &&
      (input.type === undefined || edge instanceof input.type)
    ));

    this.edges = this.edges.filter((edge) => !edgesToRemove.includes(edge));

    for (const edge of edgesToRemove) {
      edge.removeFromNodes();
    }

    return this;
  }

  #addNodeRecursively(node: Node, transaction: AddTransaction): void {
    if (transaction.nodes.includes(node)) {
      return;
    }

    if (this.nodes.includes(node)) {
      throw new Error("Node already exists in the graph.");
    }

    transaction.nodes.push(node);

    for (const edge of node.edges.from) {
      if (edge.nodes.from === undefined || edge.nodes.to === undefined) {
        throw new Error("Node has an edge with missing 'from' or 'to' node.");
      }

      const input = { edge, from: edge.nodes.from, to: edge.nodes.to };
      this.#addEdgeRecursively(input, transaction);
    }

    for (const edge of node.edges.to) {
      if (edge.nodes.from === undefined || edge.nodes.to === undefined) {
        throw new Error("Node has an edge with missing 'from' or 'to' node.");
      }

      const input = { edge, from: edge.nodes.from, to: edge.nodes.to };
      this.#addEdgeRecursively(input, transaction);
    }
  }

  #addEdgeRecursively(input: AddEdgeInput, transaction: AddTransaction): void {
    let edge: Edge;

    if (input.edge === undefined) {
      edge = new Edge();
    } else {
      if (input.edge.nodes.from !== undefined && input.edge.nodes.from !== input.from) {
        throw new Error("Edge already has another 'from' node.");
      }

      if (input.edge.nodes.to !== undefined && input.edge.nodes.to !== input.to) {
        throw new Error("Edge already has another 'to' node.");
      }

      const edgeExistsInTransaction = transaction.edges.some((e) => (
        e.edge === input.edge &&
        e.from === input.from &&
        e.to === input.to
      ));

      if (edgeExistsInTransaction) {
        return;
      }

      if (this.edges.includes(input.edge)) {
        throw new Error("Edge already exists in the graph.");
      }

      edge = input.edge;
    }

    transaction.edges.push({
      edge,
      from: input.from,
      to: input.to,
    });

    this.#addNodeRecursively(input.from, transaction);
    this.#addNodeRecursively(input.to, transaction);
  }

  #beginAddTransaction(): AddTransaction {
    return {
      nodes: [],
      edges: [],
    };
  }

  #executeAddTransaction(transaction: AddTransaction): void {
    for (const node of transaction.nodes) {
      this.nodes.push(node);
    }

    for (const edgeInput of transaction.edges) {
      const edge = edgeInput.edge ?? new Edge();
      writeable(edge.nodes).from = edgeInput.from;
      writeable(edge.nodes).to = edgeInput.to;
      this.edges.push(edge);
    }
  }
}

export type AddEdgeInput = {
  to: Node;
  from: Node;
  edge?: Edge;
};

export type RemoveEdgesInput = {
  from?: Node;
  to?: Node;
  type?: Class<Edge>;
}

type AddTransaction = {
  nodes: Node[],
  edges: AddEdgeInput[],
}