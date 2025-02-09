import { getPoolByName, POOL_TYPES } from "./pool.js";
import { Node } from "../node/node.js";
import { isClassThatExtends } from "../utils/class.js";
import { randomString } from "../utils/random-string.js";
import { Edge } from "../edge/edge.js";
import { ReferenceMismatchError } from "./errors/reference-mismatch-error.js";
import { NamedNodeQueryItem, NamedRelatedNodeQueryItem, NodeQueryItem, RelatedNodeQueryItem } from "../node/node-query-item.js";
import { EdgeQueryItem, NamedEdgeQueryItem, NamedRelatedEdgeQueryItem, RelatedEdgeQueryItem } from "../edge/edge-query-item.js";
export function parseInput(input) {
    const pools = {
        node: {},
        edge: {},
        unknown: {},
    };
    if (isSingleItem(input)) {
        parseItem(input, pools);
    }
    else if (Array.isArray(input)) {
        for (let i = 0; i < input.length; i++) {
            const item = input[i];
            const poolName = parseItem(item, pools);
            const pool = getPoolByName(poolName, pools);
            pool.outputKeys.push(i);
        }
    }
    else {
        const entries = Object.entries(input);
        for (const [key, item] of entries) {
            const poolName = parseItem(item, pools);
            const pool = getPoolByName(poolName, pools);
            pool.outputKeys.push(key);
        }
    }
    return pools;
}
function parseItem(item, pools) {
    if (typeof item === "string") {
        return parseReferenceName(item, pools);
    }
    return isNodelike(item)
        ? parseNode(item, pools)
        : parseEdge(item, pools);
}
function parseReferenceName(item, pools, parent) {
    const poolName = item;
    const existingType = POOL_TYPES.find((type) => pools[type][poolName]);
    const newType = parent?.type !== undefined
        ? getOppositePoolType(parent.type)
        : "unknown";
    if (existingType === newType) {
        return poolName;
    }
    if (newType === "unknown" && existingType !== undefined) {
        return poolName;
    }
    const isTypesMismatch = ((existingType === "node" && newType === "edge") ||
        (existingType === "edge" && newType === "node"));
    if (isTypesMismatch) {
        throw new ReferenceMismatchError(poolName, { existing: existingType, new: newType });
    }
    pools[newType][poolName] ??= {
        constraints: {},
        outputKeys: [],
    };
    if (existingType === "unknown") {
        const outputKeys = pools[existingType][poolName]?.outputKeys;
        if (outputKeys !== undefined) {
            // Assuming that the output key types are the same
            pools[newType][poolName].outputKeys.push(...outputKeys);
        }
        delete pools[existingType][poolName];
    }
    return poolName;
}
function parseNode(item, pools, parentEdge) {
    let poolName;
    if (typeof item === "string") {
        poolName = parseReferenceName(item, pools, parentEdge ? { type: "edge", ...parentEdge } : undefined);
    }
    else if (item instanceof Node) {
        poolName = parseNodeInstance(item, pools);
    }
    else if (item instanceof NodeQueryItem) {
        poolName = parseNodeQueryItem(item, pools);
    }
    else {
        poolName = parseNodeClass(item, pools);
    }
    if (parentEdge !== undefined) {
        // Set constraints on edge
        const edgePool = pools.edge[parentEdge.poolName];
        edgePool.constraints.nodes ??= {};
        if (parentEdge.direction === "fromOrTo") {
            if (edgePool.constraints.nodes.toOrFrom?.length === 2) {
                throw new Error(`Edge ${parentEdge.poolName} already has both nodes defined.`);
            }
            edgePool.constraints.nodes.toOrFrom ??= [];
            edgePool.constraints.nodes.toOrFrom.push(poolName);
        }
        else {
            edgePool.constraints.nodes[parentEdge.direction] = poolName;
        }
        // Set constraints on node
        const nodePool = pools.node[poolName];
        nodePool.constraints.edges ??= {};
        nodePool.constraints.edges[parentEdge.direction] ??= [];
        nodePool.constraints.edges[parentEdge.direction]?.push(parentEdge.poolName);
    }
    return poolName;
}
function parseNodeClass(item, pools) {
    const poolName = `${item.name} (${randomString()})`;
    pools.node[poolName] ??= {
        constraints: {
            class: item,
        },
        outputKeys: [],
    };
    return poolName;
}
function parseNodeInstance(item, pools) {
    const poolName = item.id;
    pools.node[poolName] ??= {
        constraints: {
            instance: item,
        },
        outputKeys: [],
    };
    return poolName;
}
function parseNodeQueryItem(item, pools) {
    const hasName = (item instanceof NamedNodeQueryItem ||
        item instanceof NamedRelatedNodeQueryItem);
    const hasRelations = (item instanceof RelatedNodeQueryItem ||
        item instanceof NamedRelatedNodeQueryItem);
    const poolName = hasName
        ? item.name
        : `node-query (${randomString()})`;
    if (pools.edge[poolName] !== undefined) {
        throw new ReferenceMismatchError(poolName, { existing: "edge", new: "node" });
    }
    const existingNodePool = pools.node[poolName];
    if (existingNodePool !== undefined) {
        const existingClass = existingNodePool.constraints.class;
        if (existingClass !== undefined && existingClass !== item.class) {
            if (isClassThatExtends(item.class, existingClass)) {
                // It's more specific
                existingNodePool.constraints.class = item.class;
            }
            else if (isClassThatExtends(existingClass, item.class)) {
                // It's more generic, do nothing
            }
            else {
                // It's a completely different class
                throw new ReferenceMismatchError(poolName, { existing: existingClass, new: item.class });
            }
        }
    }
    pools.node[poolName] ??= {
        constraints: {
            class: item.class,
        },
        outputKeys: [],
    };
    const existingUnknownPool = pools.unknown[poolName];
    if (existingUnknownPool !== undefined) {
        const outputKeys = existingUnknownPool.outputKeys;
        if (outputKeys !== undefined) {
            // Assuming that the output key types are the same
            pools.node[poolName].outputKeys.push(...outputKeys);
        }
        delete pools.unknown[poolName];
    }
    if (!hasRelations) {
        return poolName;
    }
    for (const withItem of item.withItems ?? []) {
        parseEdge(withItem, pools, { poolName, direction: "fromOrTo" });
    }
    for (const toItem of item.toItems ?? []) {
        const edgePoolName = `to-edge (${randomString()})`;
        pools.edge[edgePoolName] = {
            constraints: {
                nodes: {
                    from: poolName,
                }
            },
            outputKeys: [],
        };
        pools.node[poolName].constraints.edges ??= {};
        pools.node[poolName].constraints.edges.from ??= [];
        pools.node[poolName].constraints.edges.from.push(edgePoolName);
        parseNode(toItem, pools, { poolName: edgePoolName, direction: "to" });
    }
    for (const fromItem of item.fromItems ?? []) {
        const edgePoolName = `from-edge (${randomString()})`;
        pools.edge[edgePoolName] = {
            constraints: {
                nodes: {
                    to: poolName,
                }
            },
            outputKeys: [],
        };
        pools.node[poolName].constraints.edges ??= {};
        pools.node[poolName].constraints.edges.to ??= [];
        pools.node[poolName].constraints.edges.to.push(edgePoolName);
        parseNode(fromItem, pools, { poolName: edgePoolName, direction: "from" });
    }
    for (const fromOrToItem of item.fromOrToItems ?? []) {
        const edgePoolName = `from-or-to-edge (${randomString()})`;
        pools.edge[edgePoolName] = {
            constraints: {
                nodes: {
                    toOrFrom: [poolName],
                }
            },
            outputKeys: [],
        };
        pools.node[poolName].constraints.edges ??= {};
        pools.node[poolName].constraints.edges.fromOrTo ??= [];
        pools.node[poolName].constraints.edges.fromOrTo.push(edgePoolName);
        parseNode(fromOrToItem, pools, { poolName: edgePoolName, direction: "fromOrTo" });
    }
    return poolName;
}
function parseEdge(item, pools, parentNode) {
    let poolName;
    if (typeof item === "string") {
        poolName = parseReferenceName(item, pools, parentNode ? { type: "node", ...parentNode } : undefined);
    }
    else if (item instanceof Edge) {
        poolName = parseEdgeInstance(item, pools);
    }
    else if (item instanceof EdgeQueryItem) {
        poolName = parseEdgeQueryItem(item, pools);
        const hasRelations = (item instanceof RelatedEdgeQueryItem ||
            item instanceof NamedRelatedEdgeQueryItem);
        if (hasRelations && parentNode?.direction === "fromOrTo") {
            const isImplicitlyFrom = item.toItem !== undefined && item.fromItem === undefined;
            const isImplicitlyTo = item.toItem === undefined && item.fromItem !== undefined;
            if (isImplicitlyFrom) {
                parentNode.direction = "from";
            }
            if (isImplicitlyTo) {
                parentNode.direction = "to";
            }
        }
    }
    else {
        poolName = parseEdgeClass(item, pools);
    }
    if (parentNode !== undefined) {
        // Set constraints on node
        const nodePool = pools.node[parentNode.poolName];
        nodePool.constraints.edges ??= {};
        nodePool.constraints.edges[parentNode.direction] ??= [];
        nodePool.constraints.edges[parentNode.direction]?.push(poolName);
        // Set constraints on edge
        const edgePool = pools.edge[poolName];
        if (parentNode.direction === "fromOrTo") {
            if (edgePool.constraints.nodes?.toOrFrom?.length === 2) {
                throw new Error(`Edge ${poolName} already has both nodes defined.`);
            }
            edgePool.constraints.nodes ??= {};
            edgePool.constraints.nodes.toOrFrom ??= [];
            edgePool.constraints.nodes.toOrFrom.push(parentNode.poolName);
        }
        else {
            edgePool.constraints.nodes ??= {};
            edgePool.constraints.nodes[parentNode.direction] = parentNode.poolName;
        }
    }
    return poolName;
}
function parseEdgeClass(item, pools) {
    const poolName = `${item.name} (${randomString()})`;
    pools.edge[poolName] ??= {
        constraints: {
            class: item,
        },
        outputKeys: [],
    };
    return poolName;
}
function parseEdgeInstance(item, pools) {
    const poolName = item.id;
    pools.edge[poolName] ??= {
        constraints: {
            instance: item,
        },
        outputKeys: [],
    };
    return poolName;
}
function parseEdgeQueryItem(item, pools) {
    const hasName = (item instanceof NamedEdgeQueryItem ||
        item instanceof NamedRelatedEdgeQueryItem);
    const hasRelations = (item instanceof RelatedEdgeQueryItem ||
        item instanceof NamedRelatedEdgeQueryItem);
    const poolName = hasName
        ? item.name
        : `edge-query (${randomString()})`;
    if (pools.node[poolName] !== undefined) {
        throw new ReferenceMismatchError(poolName, { existing: "node", new: "edge" });
    }
    const existingPool = pools.edge[poolName];
    if (existingPool !== undefined) {
        const existingClass = existingPool.constraints.class;
        if (existingClass !== undefined && existingClass !== item.class) {
            if (isClassThatExtends(item.class, existingClass)) {
                // It's more specific
                existingPool.constraints.class = item.class;
            }
            else if (isClassThatExtends(existingClass, item.class)) {
                // It's more generic, do nothing
            }
            else {
                // It's a completely different class
                throw new ReferenceMismatchError(poolName, { existing: existingClass, new: item.class });
            }
        }
    }
    pools.edge[poolName] ??= {
        constraints: {
            class: item.class,
        },
        outputKeys: [],
    };
    const existingUnknownPool = pools.unknown[poolName];
    if (existingUnknownPool !== undefined) {
        const outputKeys = existingUnknownPool.outputKeys;
        if (outputKeys !== undefined) {
            // Assuming that the output key types are the same
            pools.edge[poolName].outputKeys.push(...outputKeys);
        }
        delete pools.unknown[poolName];
    }
    if (!hasRelations) {
        return poolName;
    }
    if (item.toItem !== undefined) {
        parseNode(item.toItem, pools, { poolName, direction: "to" });
    }
    if (item.fromItem !== undefined) {
        parseNode(item.fromItem, pools, { poolName, direction: "from" });
    }
    if (item.fromOrToItems !== undefined) {
        for (const fromOrToItem of item.fromOrToItems) {
            parseNode(fromOrToItem, pools, { poolName, direction: "fromOrTo" });
        }
    }
    return poolName;
}
export function isSingleItem(input) {
    return (!Array.isArray(input) &&
        input.constructor.name !== "Object");
}
export function isNodelike(item) {
    return (isClassThatExtends(item, Node) ||
        item instanceof Node ||
        item instanceof NodeQueryItem);
}
export function isEdgelike(item) {
    return (isClassThatExtends(item, Edge) ||
        item instanceof Edge ||
        item instanceof EdgeQueryItem);
}
export function getOppositeDirection(direction) {
    switch (direction) {
        case "from": return "to";
        case "to": return "from";
        case "fromOrTo": return "fromOrTo";
    }
}
function getOppositePoolType(type) {
    switch (type) {
        case "node": return "edge";
        case "edge": return "node";
        default: return "unknown";
    }
}
//# sourceMappingURL=parsing.js.map