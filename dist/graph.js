import { Edge } from "./edge/edge.js";
import { Node } from "./node/node.js";
import { query } from "./query/query.js";
import { getClassHierarchy } from "./utils/class.js";
export class Graph {
    indices = {
        nodesByEdge: new Map(),
        edgesByNode: new Map(),
        nodesByType: new Map(),
        edgesByType: new Map(),
    };
    query(input) {
        return query(this, input);
    }
    addNode(node) {
        const allNodes = this.indices.nodesByType.get(Node);
        if (allNodes?.has(node)) {
            return node;
        }
        const types = getClassHierarchy(node.constructor);
        for (const type of types) {
            let nodesByType = this.indices.nodesByType.get(type);
            if (nodesByType === undefined) {
                nodesByType = new Set();
                this.indices.nodesByType.set(type, nodesByType);
            }
            nodesByType.add(node);
        }
        const hasEdges = node.edges.from.size > 0 || node.edges.to.size > 0;
        if (hasEdges) {
            for (const edge of node.edges.from) {
                if (edge.nodes.to === undefined || edge.nodes.from === undefined) {
                    throw new Error(`Edge ${edge.id} is missing from/to nodes.`);
                }
                this.addEdge({ edge, from: edge.nodes.from, to: edge.nodes.to });
            }
            for (const edge of node.edges.to) {
                if (edge.nodes.to === undefined || edge.nodes.from === undefined) {
                    throw new Error(`Edge ${edge.id} is missing from/to nodes.`);
                }
                this.addEdge({ edge, from: edge.nodes.from, to: edge.nodes.to });
            }
        }
        if (node.graph !== this) {
            node.graph.removeNode(node);
            node.graph = this;
        }
        return node;
    }
    addNodes(nodes) {
        return nodes.map((n) => this.addNode(n));
    }
    removeNode(node) {
        const edgesByNode = this.indices.edgesByNode.get(node);
        if (edgesByNode !== undefined) {
            for (const edge of edgesByNode.from) {
                this.removeEdge(edge);
            }
            for (const edge of edgesByNode.to) {
                this.removeEdge(edge);
            }
            this.indices.edgesByNode.delete(node);
        }
        const types = getClassHierarchy(node.constructor);
        for (const type of types) {
            const nodesByType = this.indices.nodesByType.get(type);
            if (nodesByType !== undefined) {
                nodesByType.delete(node);
            }
        }
    }
    removeNodes(nodes) {
        for (const node of nodes) {
            this.removeNode(node);
        }
    }
    removeNodesByType(type) {
        for (const [indexType, nodes] of this.indices.nodesByType.entries()) {
            const classHierarchy = getClassHierarchy(indexType);
            if (!classHierarchy.includes(type)) {
                continue;
            }
            for (const node of nodes) {
                this.removeNode(node);
            }
        }
    }
    addEdge(input) {
        const allEdges = this.indices.edgesByType.get(Edge);
        if (input.edge !== undefined &&
            allEdges?.has(input.edge)) {
            return input.edge;
        }
        const edge = input.edge ?? new Edge();
        const types = getClassHierarchy(edge.constructor);
        for (const type of types) {
            let edgesByType = this.indices.edgesByType.get(type);
            if (edgesByType === undefined) {
                edgesByType = new Set();
                this.indices.edgesByType.set(type, edgesByType);
            }
            edgesByType.add(edge);
        }
        let nodesByEdge = this.indices.nodesByEdge.get(edge);
        if (nodesByEdge === undefined) {
            nodesByEdge = {
                from: input.from,
                to: input.to,
            };
            this.indices.nodesByEdge.set(edge, nodesByEdge);
        }
        nodesByEdge.from = input.from;
        nodesByEdge.to = input.to;
        let edgesByFromNode = this.indices.edgesByNode.get(input.from);
        if (edgesByFromNode === undefined) {
            edgesByFromNode = {
                from: new Set(),
                to: new Set(),
            };
            this.indices.edgesByNode.set(input.from, edgesByFromNode);
        }
        let edgesByToNode = this.indices.edgesByNode.get(input.to);
        if (edgesByToNode === undefined) {
            edgesByToNode = {
                from: new Set(),
                to: new Set(),
            };
            this.indices.edgesByNode.set(input.to, edgesByToNode);
        }
        edgesByFromNode.from.add(edge);
        edgesByToNode.to.add(edge);
        this.addNode(input.from);
        this.addNode(input.to);
        if (edge.graph !== this) {
            edge.graph.removeEdge(edge);
            edge.graph = this;
        }
        return edge;
    }
    removeEdge(edge) {
        const nodesByEdge = this.indices.nodesByEdge.get(edge);
        if (nodesByEdge !== undefined) {
            this.indices.edgesByNode.get(nodesByEdge.from)?.from.delete(edge);
            this.indices.edgesByNode.get(nodesByEdge.to)?.to.delete(edge);
            this.indices.nodesByEdge.delete(edge);
        }
        const types = getClassHierarchy(edge.constructor);
        for (const type of types) {
            const edgesByType = this.indices.edgesByType.get(type);
            if (edgesByType !== undefined) {
                edgesByType.delete(edge);
            }
        }
    }
    removeEdges(edges) {
        for (const edge of edges) {
            this.removeEdge(edge);
        }
    }
    removeEdgesByNodes(input) {
        let edgesSet;
        if ("fromOrTo" in input) {
            const edgesByNode = this.indices.edgesByNode.get(input.fromOrTo);
            if (edgesByNode?.from !== undefined && edgesByNode.to !== undefined) {
                edgesSet = edgesByNode.from.union(edgesByNode.to);
            }
            else {
                edgesSet = edgesByNode?.from ?? edgesByNode?.to;
            }
        }
        else {
            let fromEdges;
            let toEdges;
            if (input.from !== undefined) {
                fromEdges = this.indices.edgesByNode.get(input.from)?.from;
            }
            if (input.to !== undefined) {
                toEdges = this.indices.edgesByNode.get(input.to)?.to;
            }
            if (fromEdges !== undefined && toEdges !== undefined) {
                edgesSet = fromEdges.intersection(toEdges);
            }
            else {
                edgesSet = fromEdges ?? toEdges;
            }
        }
        if (edgesSet === undefined) {
            return;
        }
        let edgesArray = Array.from(edgesSet);
        if (input.type !== undefined) {
            const type = input.type; // For type narrowing inside the filter function
            edgesArray = edgesArray.filter((edge) => edge instanceof type);
        }
        for (const edge of edgesArray) {
            this.removeEdge(edge);
        }
    }
    removeEdgesByType(type) {
        for (const [indexType, edges] of this.indices.edgesByType.entries()) {
            const classHierarchy = getClassHierarchy(indexType);
            if (!classHierarchy.includes(type)) {
                continue;
            }
            for (const edge of edges) {
                this.removeEdge(edge);
            }
        }
    }
}
export const defaultGraph = new Graph();
Node.defaultGraph = defaultGraph;
Edge.defaultGraph = defaultGraph;
//# sourceMappingURL=graph.js.map