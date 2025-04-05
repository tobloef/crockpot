import { Edge } from "../edge/edge.js";
import { isClassThatExtends } from "../utils/class.js";
import { randomString } from "../utils/random-string.js";
import {} from "../graph.js";
import { NamedNodeQueryItem, NodeQueryItem, RelatedNodeQueryItem, } from "./node-query-item.js";
export class Node {
    #brand = "Node";
    static defaultGraph;
    id = randomString();
    graph = Node.defaultGraph;
    get edges() {
        return (this.graph.indices.edgesByNode.get(this) ??
            this.#createEmptyEdges());
    }
    static excluding(...excludedClassTypes) {
        return new NodeQueryItem({
            class: this,
            excludedClassTypes,
        });
    }
    static as(name) {
        return new NamedNodeQueryItem({
            class: this,
            name,
        });
    }
    static with(...items) {
        return new RelatedNodeQueryItem({
            withItems: items,
            class: this,
        });
    }
    static to(...items) {
        return new RelatedNodeQueryItem({
            toItems: items,
            class: this,
        });
    }
    static from(...items) {
        return new RelatedNodeQueryItem({
            fromItems: items,
            class: this,
        });
    }
    static fromOrTo(...items) {
        return new RelatedNodeQueryItem({
            fromOrToItems: items,
            class: this,
        });
    }
    addEdge(input) {
        if ("to" in input) {
            return this.graph.addEdge({
                from: this,
                to: input.to,
                edge: input.edge,
            });
        }
        else {
            return this.graph.addEdge({
                from: input.from,
                to: this,
                edge: input.edge,
            });
        }
    }
    removeEdge(edge) {
        this.graph.removeEdge(edge);
    }
    removeEdges(input) {
        if (input !== undefined && "to" in input) {
            this.graph.removeEdgesByNodes({
                from: this,
                to: input.to,
                type: input.type,
            });
        }
        else if (input !== undefined && "from" in input) {
            this.graph.removeEdgesByNodes({
                from: input.from,
                to: this,
                type: input.type,
            });
        }
        else {
            this.graph.removeEdgesByNodes({
                fromOrTo: this,
                type: input?.type,
            });
        }
    }
    remove() {
        this.graph.removeNode(this);
    }
    getOneRelated(edgeType, direction, nodeType) {
        if (direction === "fromOrTo") {
            return (this.getOneRelated(edgeType, "to", nodeType) ??
                this.getOneRelated(edgeType, "from", nodeType));
        }
        const oppositeDirection = direction === "from" ? "to" : "from";
        for (const edge of this.edges[oppositeDirection].values()) {
            if (edgeType !== Edge &&
                !isClassThatExtends(edge.constructor, edgeType)) {
                continue;
            }
            const otherNode = edge.nodes[direction];
            if (otherNode === undefined) {
                continue;
            }
            if (nodeType !== Node &&
                !isClassThatExtends(otherNode.constructor, nodeType)) {
                continue;
            }
            return {
                node: otherNode,
                edge: edge,
            };
        }
        return {
            node: undefined,
            edge: undefined,
        };
    }
    *getAllRelated(edgeType, direction, nodeType) {
        if (direction === "fromOrTo") {
            yield* this.getAllRelated(edgeType, "from", nodeType);
            yield* this.getAllRelated(edgeType, "to", nodeType);
            return;
        }
        const oppositeDirection = direction === "from" ? "to" : "from";
        for (const edge of this.edges[oppositeDirection].values()) {
            if (edgeType !== Edge &&
                !isClassThatExtends(edge.constructor, edgeType)) {
                continue;
            }
            const otherNode = edge.nodes[direction];
            if (otherNode === undefined) {
                continue;
            }
            if (nodeType !== Node &&
                !isClassThatExtends(otherNode.constructor, nodeType)) {
                continue;
            }
            yield {
                node: otherNode,
                edge: edge,
            };
        }
    }
    #createEmptyEdges() {
        return {
            from: new Set(),
            to: new Set(),
        };
    }
}
//# sourceMappingURL=node.js.map