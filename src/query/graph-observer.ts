import type { QueryInput, QueryOutput, } from "./run-query.types.ts";
import type { Graph } from "../graph.ts";
import { isItemRelatedToSlots, parseInput, type QuerySlots } from "./parse-input.ts";
import { runQuery } from "./run-query.js";
import { Node } from "../node/node.js";
import { Edge } from "../edge/edge.js";

export type GraphObserverOptions = {}

export class GraphObserver<
  Input extends QueryInput,
  Output extends QueryOutput<any>
> {
  readonly graph: Graph;
  readonly input: Input;
  readonly options: GraphObserverOptions;

  readonly #slots: QuerySlots;
  #cache: Map<string, Output>;
  #addedResults: Output[] = [];
  #removedResults: Output[] = [];

  constructor(
    graph: Graph,
    input: Input,
    options: GraphObserverOptions = {}
  ) {
    this.graph = graph;
    this.input = input;
    this.#slots = parseInput(input);
    this.options = options;

    this.#cache = this.#getNewCache();
    this.graph.subscribeToNotifications(this);
  }

  *added(): Generator<Output> {
    for (const result of this.#addedResults) {
      yield result;
    }

    this.#addedResults = [];
  }

  *removed(): Generator<Output> {
    for (const result of this.#removedResults) {
      yield result;
    }

    this.#removedResults = [];
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
    this.#cache.clear();
    this.#addedResults = [];
    this.#removedResults = [];
    this.graph.unsubscribeFromNotifications(this);
  }

  #updateQuery() {
    const newCache = this.#getNewCache();

    for (const [hash, result] of newCache) {
      if (!this.#cache.has(hash)) {
        this.#addedResults.push(result);
      }
    }

    for (const [hash, result] of this.#cache) {
      if (!newCache.has(hash)) {
        this.#removedResults.push(result);
      }
    }

    this.#cache = newCache;
  }

  #getNewCache(): Map<string, Output> {
    const cache = new Map<string, QueryOutput<Input>>();
    const results = runQuery(this.graph, this.input as any);

    for (const output of results) {
      cache.set(output.__hash, output);
    }

    return cache;
  }
}
