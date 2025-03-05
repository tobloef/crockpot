import type { QueryInput, QueryOutput, } from "./run-query.types.ts";
import type { Graph } from "../graph.ts";
import { isItemRelatedToSlots, parseInput, type QuerySlots } from "./parse-input.ts";
import { runQuery, runQueryBySlots } from "./run-query.js";
import { Node } from "../node/node.js";
import { Edge } from "../edge/edge.js";

export type GraphQueryOptions = {
  cache?: boolean;
}

export class GraphQuery<
  Input extends QueryInput,
  Output extends QueryOutput<any>
> {
  readonly graph: Graph;
  readonly input: Input;
  readonly options: Readonly<GraphQueryOptions>;

  readonly #slots: QuerySlots;
  #cache?: Output[];

  constructor(
    graph: Graph,
    input: Input,
    options: GraphQueryOptions = {}
  ) {
    this.graph = graph;
    this.input = input;
    this.#slots = parseInput(input);
    this.options = options;

    if (this.options.cache) {
      this.#cache = this.#getNewCache();
      this.graph.subscribeToNotifications(this);
    }
  }

  *run(): Iterable<Output> {
    if (this.options.cache) {
      yield* this.#cache!.values();
    } else {
      yield* runQueryBySlots(this.graph, this.#slots);
    }
  }

  notifyAdded(item: Node | Edge) {
    if (!isItemRelatedToSlots(item, this.#slots)) {
      return;
    }

    this.#updateQuery();
  }

  notifyRemoved(item: Node | Edge) {
    if (!isItemRelatedToSlots(item, this.#slots)) {
      return;
    }

    this.#updateQuery();
  }

  destroy() {
    this.#cache = undefined;
    this.graph.unsubscribeFromNotifications(this);
  }

  #updateQuery() {
    this.#cache = this.#getNewCache();
  }

  #getNewCache(): Output[] {
    const newCache = runQuery(this.graph, this.input as any).toArray();

    return newCache;
  }
}
