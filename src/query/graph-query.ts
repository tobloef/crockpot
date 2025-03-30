import type {
  QueryInput,
  QueryOutput,
} from "./run-query.types.ts";
import type { Changelist, Graph } from "../graph.ts";
import {
  isItemRelatedToSlots,
  parseInput,
  type QuerySlots,
} from "./parse-input.ts";
import { runQueryBySlots } from "./run-query.ts";
import { Node } from "../node/node.ts";
import { Edge } from "../edge/edge.ts";

export type GraphQueryOptions = {
  cache?: boolean;
}

export class GraphQuery<
  Output extends QueryOutput<any>
> {
  readonly graph: Graph;
  readonly input: QueryInput;
  readonly options: Readonly<GraphQueryOptions>;

  readonly #slots: QuerySlots;
  readonly #unsubscribeItemsChanged?: () => void;
  #cache?: Output[];

  constructor(
    graph: Graph,
    input: QueryInput,
    options: GraphQueryOptions = {}
  ) {
    this.graph = graph;
    this.input = input;
    this.#slots = parseInput(input);
    this.options = options;

    if (this.options.cache) {
      this.#cache = this.#getNewCache();

      this.#unsubscribeItemsChanged = this.graph.onItemsChanged(
        this.#handleItemsChanged.bind(this)
      );
    }
  }

  *run(): Iterable<Output> {
    if (this.options.cache) {
      yield* this.#cache!.values();
    } else {
      yield* runQueryBySlots(this.graph, this.#slots);
    }
  }

  #handleItemsChanged(changes: Changelist) {
    const allItems = [...changes.added, ...changes.removed];

    let shouldUpdate = false;

    for (const item of allItems) {
      if (isItemRelatedToSlots(item, this.#slots)) {
        shouldUpdate = true;
        break;
      }
    }

    if (shouldUpdate) {
      this.#updateQuery();
    }
  }

  destroy() {
    this.#cache = undefined;
    this.#unsubscribeItemsChanged?.();
  }

  #updateQuery() {
    this.#cache = this.#getNewCache();
  }

  #getNewCache(): Output[] {
    const newCache = runQueryBySlots(this.graph, this.#slots).toArray();

    return newCache;
  }
}
