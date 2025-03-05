import { isItemRelatedToSlots, parseInput } from "./parse-input.js";
import { runQuery } from "./run-query.js";
import { Node } from "../node/node.js";
import { Edge } from "../edge/edge.js";
import { getOutputHash } from "./create-outputs.js";
export class GraphObserver {
    graph;
    input;
    options;
    #cache;
    #addedResults = [];
    #removedResults = [];
    #slots;
    #additionListeners = new Set();
    #removalListeners = new Set();
    #unsubscribeItemAdded;
    #unsubscribeItemRemoved;
    constructor(graph, input, options = {}) {
        this.graph = graph;
        this.input = input;
        this.#slots = parseInput(input);
        this.options = options;
        this.#cache = this.#getNewCache();
        this.#unsubscribeItemAdded = this.graph.onItemAdded(this.#handleItemAdded.bind(this));
        this.#unsubscribeItemRemoved = this.graph.onItemRemoved(this.#handleItemRemoved.bind(this));
    }
    *added() {
        for (const result of this.#addedResults) {
            yield result;
        }
        this.#addedResults = [];
    }
    *removed() {
        for (const result of this.#removedResults) {
            yield result;
        }
        this.#removedResults = [];
    }
    onAdded(listener) {
        this.#additionListeners.add(listener);
    }
    onRemoved(listener) {
        this.#removalListeners.add(listener);
    }
    #handleItemAdded(item) {
        if (!isItemRelatedToSlots(item, this.#slots)) {
            return;
        }
        this.#updateQuery();
    }
    #handleItemRemoved(item) {
        if (!isItemRelatedToSlots(item, this.#slots)) {
            return;
        }
        this.#updateQuery();
    }
    destroy() {
        this.#cache.clear();
        this.#addedResults = [];
        this.#removedResults = [];
        this.#unsubscribeItemAdded?.();
        this.#unsubscribeItemRemoved?.();
    }
    #updateQuery() {
        const newCache = this.#getNewCache();
        for (const [hash, result] of newCache) {
            if (!this.#cache.has(hash)) {
                for (const listener of this.#additionListeners) {
                    listener(result);
                }
                this.#addedResults.push(result);
            }
        }
        for (const [hash, result] of this.#cache) {
            if (!newCache.has(hash)) {
                for (const listener of this.#removalListeners) {
                    listener(result);
                }
                this.#removedResults.push(result);
            }
        }
        this.#cache = newCache;
    }
    #getNewCache() {
        const cache = new Map();
        const results = runQuery(this.graph, this.input);
        for (const output of results) {
            const hash = getOutputHash(output);
            cache.set(hash, output);
        }
        return cache;
    }
}
//# sourceMappingURL=graph-observer.js.map