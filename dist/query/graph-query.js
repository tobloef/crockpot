import { isItemRelatedToSlots, parseInput } from "./parse-input.js";
import { runQueryBySlots } from "./run-query.js";
import { Node } from "../node/node.js";
import { Edge } from "../edge/edge.js";
export class GraphQuery {
    graph;
    input;
    options;
    #slots;
    #unsubscribeItemAdded;
    #unsubscribeItemRemoved;
    #cache;
    constructor(graph, input, options = {}) {
        this.graph = graph;
        this.input = input;
        this.#slots = parseInput(input);
        this.options = options;
        if (this.options.cache) {
            this.#cache = this.#getNewCache();
            this.#unsubscribeItemAdded = this.graph.onItemAdded(this.#handleItemAdded.bind(this));
            this.#unsubscribeItemRemoved = this.graph.onItemRemoved(this.#handleItemRemoved.bind(this));
        }
    }
    *run() {
        if (this.options.cache) {
            yield* this.#cache.values();
        }
        else {
            yield* runQueryBySlots(this.graph, this.#slots);
        }
    }
    #handleItemAdded(item) {
        if (!isItemRelatedToSlots(item, this.#slots)) {
            return;
        }
        // When this needs to be optimized, take a look the fix-in-place approach
        // outlined on page two of your medium-sized yellow notebook.
        this.#updateQuery();
    }
    #handleItemRemoved(item) {
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
    #getNewCache() {
        const newCache = runQueryBySlots(this.graph, this.#slots).toArray();
        return newCache;
    }
}
//# sourceMappingURL=graph-query.js.map