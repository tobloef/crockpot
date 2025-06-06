import { randomString } from "../utils/random-string.js";
import {} from "../graph.js";
import { EdgeQueryItem, NamedEdgeQueryItem, RelatedEdgeQueryItem, } from "./edge-query-item.js";
export class Edge {
    #brand = "Edge";
    static defaultGraph;
    id = randomString();
    graph = Edge.defaultGraph;
    get nodes() {
        return (this.graph.indices.nodesByEdge.get(this) ??
            this.#createEmptyNodes());
    }
    static excluding(...excludedClassTypes) {
        return new EdgeQueryItem({
            class: this,
            excludedClassTypes,
        });
    }
    static as(name) {
        return new NamedEdgeQueryItem({
            class: this,
            name,
        });
    }
    static to(item) {
        return new RelatedEdgeQueryItem({
            toItem: item,
            class: this,
        });
    }
    static from(item) {
        return new RelatedEdgeQueryItem({
            fromItem: item,
            class: this,
        });
    }
    static fromOrTo(...items) {
        return new RelatedEdgeQueryItem({
            fromOrToItems: items,
            class: this,
        });
    }
    replaceNode(direction, node) {
        this.graph.removeEdge(this);
        if (direction === "to") {
            this.graph.addEdge({
                to: node,
                from: this.nodes["from"],
                edge: this,
            });
        }
        else {
            this.graph.addEdge({
                to: this.nodes["to"],
                from: node,
                edge: this,
            });
        }
    }
    remove() {
        this.graph.removeEdge(this);
    }
    #createEmptyNodes() {
        return {
            from: undefined,
            to: undefined,
        };
    }
}
//# sourceMappingURL=edge.js.map