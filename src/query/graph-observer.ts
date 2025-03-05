import type { QueryInput, QueryOutput, } from "./run-query.types.ts";
import type { Graph } from "../graph.ts";
import { isItemRelatedToSlots, parseInput, type QuerySlots } from "./parse-input.ts";
import { runQuery } from "./run-query.ts";
import { Node } from "../node/node.ts";
import { Edge } from "../edge/edge.ts";
import { getOutputHash } from "./create-outputs.ts";

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
  #addedListeners: Set<(item: Output) => void> = new Set();
  #removedListeners: Set<(item: Output) => void> = new Set();

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

  onAdded(listener: (item: Output) => void) {
    this.#addedListeners.add(listener);
  }

  onRemoved(listener: (item: Output) => void) {
    this.#removedListeners.add(listener);
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
        for (const listener of this.#addedListeners) {
          listener(result);
        }
        this.#addedResults.push(result);
      }
    }

    for (const [hash, result] of this.#cache) {
      if (!newCache.has(hash)) {
        for (const listener of this.#removedListeners) {
          listener(result);
        }
        this.#removedResults.push(result);
      }
    }

    this.#cache = newCache;
  }

  #getNewCache(): Map<string, Output> {
    const cache = new Map<string, QueryOutput<Input>>();
    const results = runQuery(this.graph, this.input as any);

    for (const output of results) {
      const hash = getOutputHash(output);
      cache.set(hash, output);
    }

    return cache;
  }
}
