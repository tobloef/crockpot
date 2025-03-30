import type {
  QueryInput,
  QueryOutput,
} from "./run-query.types.ts";
import type { Graph } from "../graph.ts";
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
  readonly #unsubscribeItemAdded?: () => void;
  readonly #unsubscribeItemRemoved?: () => void;
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

      this.#unsubscribeItemAdded = this.graph.onItemAdded(
        this.#handleItemAdded.bind(this)
      );

      this.#unsubscribeItemRemoved = this.graph.onItemRemoved(
        this.#handleItemRemoved.bind(this)
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

  #handleItemAdded(item: Node | Edge) {
    if (!isItemRelatedToSlots(item, this.#slots)) {
      return;
    }

    // When this needs to be optimized, take a look the fix-in-place approach
    // outlined on page two of your medium-sized yellow notebook.

    this.#updateQuery();
  }

  #handleItemRemoved(item: Node | Edge) {
    if (!isItemRelatedToSlots(item, this.#slots)) {
      return;
    }

    // When this needs to be optimized, take a look the fix-in-place approach
    // outlined on page two of your medium-sized yellow notebook.

    this.#updateQuery();
  }

  destroy() {
    this.#cache = undefined;
    this.#unsubscribeItemAdded?.();
    this.#unsubscribeItemRemoved?.();
  }

  #updateQuery() {
    this.#cache = this.#getNewCache();
  }

  #getNewCache(): Output[] {
    const newCache = runQueryBySlots(this.graph, this.#slots).toArray();

    return newCache;
  }
}
