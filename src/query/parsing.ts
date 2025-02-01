import type { Edgelike, Nodelike, QueryInput, QueryInputItem, ReferenceName } from "./query.types.ts";
import { type EdgePool, getPoolByName, type NodePool, POOL_TYPES, type PoolName, type Pools, type PoolType } from "./pool.ts";
import { Node } from "../node/node.ts";
import { NodeQueryItem } from "../node/node-query-item.ts";
import { type Class, isClassThatExtends } from "../utils/class.ts";
import { randomString } from "../utils/random-string.ts";
import { Edge, type EdgeDirection } from "../edge/edge.ts";
import { EdgeQueryItem } from "../edge/edge-query-item.ts";
import { ReferenceMismatchError } from "./errors/reference-mismatch-error.ts";

export function parseInput(
  input: QueryInput,
): Pools {
  const pools: Pools = {
    node: {},
    edge: {},
    unknown: {},
  };

  if (isSingleItem(input)) {
    parseItem(input, pools);
  } else if (Array.isArray(input)) {
    for (let i = 0; i < input.length; i++) {
      const item = input[i]!;
      const poolName = parseItem(item, pools);
      const pool = getPoolByName(poolName, pools)!;
      pool.outputKey = i;
    }
  } else {
    const entries = Object.entries(input);
    for (const [key, item] of entries) {
      const poolName = parseItem(item, pools);
      const pool = getPoolByName(poolName, pools)!;
      pool.outputKey = key;
    }
  }

  return pools;
}

function parseItem(
  item: Nodelike | Edgelike,
  pools: Pools,
): PoolName {
  if (typeof item === "string") {
    return parseReferenceName(item, pools);
  }

  return isNodelike(item)
    ? parseNode(item, pools)
    : parseEdge(item, pools);
}

function parseReferenceName(
  item: ReferenceName,
  pools: Pools,
  parent?: {
    type: PoolType,
    poolName: PoolName,
    direction: EdgeDirection
  }
): PoolName {
  const poolName = item;

  const existingType = POOL_TYPES.find((type) => pools[type][poolName]);

  const newType = parent?.type !== undefined
    ? getOppositePoolType(parent.type)
    : "unknown";

  if (existingType === newType) {
    return poolName;
  }

  const isTypesMismatch = (
    (existingType === "node" && newType === "edge") ||
    (existingType === "edge" && newType === "node")
  );

  if (isTypesMismatch) {
    throw new ReferenceMismatchError(
      poolName,
      {existing: existingType, new: newType }
    );
  }

  const newPool = {
    constraints: {},
  };

  pools[newType][poolName] ??= newPool;

  if (existingType === "unknown") {
    delete pools[existingType][poolName];
  }

  return poolName;
}

function parseNode(
  item: Nodelike,
  pools: Pools,
  parentEdge?: {
    poolName: PoolName,
    direction: EdgeDirection,
  }
): PoolName {
  let poolName: PoolName;

  if (typeof item === "string") {
    poolName = parseReferenceName(
      item,
      pools,
      parentEdge ? { type: "edge", ...parentEdge } : undefined
    );
  } else if (item instanceof Node) {
    poolName = parseNodeInstance(item, pools);
  } else if (item instanceof NodeQueryItem) {
    poolName = parseNodeQueryItem(item, pools);
  } else {
    poolName = parseNodeClass(item, pools);
  }

  if (parentEdge !== undefined) {
    // Set constraints on edge
    const edgePool = pools.edge[parentEdge.poolName]!;
    edgePool.constraints.nodes ??= {};

    if (parentEdge.direction === "fromOrTo") {
      if (edgePool.constraints.nodes.toOrFrom?.length === 2) {
        throw new Error(`Edge ${parentEdge.poolName} already has both nodes defined.`);
      }

      edgePool.constraints.nodes.toOrFrom ??= [];
      edgePool.constraints.nodes.toOrFrom.push(poolName);
    } else {
      edgePool.constraints.nodes[parentEdge.direction] = poolName;
    }

    // Set constraints on node
    const nodePool = pools.node[poolName]!;
    nodePool.constraints.edges ??= {};
    nodePool.constraints.edges[parentEdge.direction] ??= [];
    nodePool.constraints.edges[parentEdge.direction]?.push(parentEdge.poolName);
  }

  return poolName;
}

function parseNodeClass(item: Class<Node>, pools: Pools): PoolName {
  const poolName = randomString();

  pools.node[poolName] = {
    constraints: {
      class: item,
    }
  };

  return poolName;
}

function parseNodeInstance(item: Node, pools: Pools): PoolName {
  const poolName = item.id;

  pools.node[poolName] = {
    constraints: {
      instance: item,
    }
  };

  return poolName;
}

function parseNodeQueryItem(item: NodeQueryItem, pools: Pools): PoolName {
  const poolName = item.name ?? randomString();

  const existingPool = pools.node[poolName];

  if (existingPool !== undefined) {
    const existingClass = existingPool.constraints.class;

    if (existingClass !== undefined && existingClass !== item.class) {
      if (isClassThatExtends(item.class, existingClass)) {
        // It's more specific
        existingPool.constraints.class = item.class;
      } else if (isClassThatExtends(existingClass, item.class)) {
        // It's more generic, do nothing
      } else {
        // It's a completely different class
        throw new Error(`Node class mismatch for ${poolName}: ${existingClass} and ${item.class}`);
      }
    }
  }

  pools.node[poolName] ??= {
    constraints: {
      class: item.class,
    }
  };

  for (const withItem of item.withItems ?? []) {
    parseEdge(withItem, pools, { poolName, direction: "fromOrTo" });
  }

  for (const toItem of item.toItems ?? []) {
    const edgePoolName = randomString();

    pools.edge[edgePoolName] = {
      constraints: {
        nodes: {
          from: poolName,
        }
      },
    };

    pools.node[poolName].constraints.edges ??= {};
    pools.node[poolName].constraints.edges.from ??= [];
    pools.node[poolName].constraints.edges.from.push(edgePoolName);

    parseNode(toItem, pools, { poolName: edgePoolName, direction: "to" });
  }

  for (const fromItem of item.fromItems ?? []) {
    const edgePoolName = randomString();

    pools.edge[edgePoolName] = {
      constraints: {
        nodes: {
          to: poolName,
        }
      },
    };

    pools.node[poolName].constraints.edges ??= {};
    pools.node[poolName].constraints.edges.to ??= [];
    pools.node[poolName].constraints.edges.to.push(edgePoolName);

    parseNode(fromItem, pools, { poolName: edgePoolName, direction: "from" });
  }

  return poolName;
}

function parseEdge(
  item: Edgelike,
  pools: Pools,
  parentNode?: {
    poolName: PoolName,
    direction: EdgeDirection,
  },
): PoolName {
  let poolName: PoolName;

  if (typeof item === "string") {
    poolName = parseReferenceName(
      item,
      pools,
      parentNode ? { type: "node", ...parentNode } : undefined
    );
  } else if (item instanceof Edge) {
    poolName = parseEdgeInstance(item, pools);
  } else if (item instanceof EdgeQueryItem) {
    poolName = parseEdgeQueryItem(item, pools);
  } else {
    poolName = parseEdgeClass(item, pools);
  }

  if (parentNode !== undefined) {
    // Set constraints on node
    const nodePool = pools.node[parentNode.poolName]!;
    nodePool.constraints.edges ??= {};
    nodePool.constraints.edges[parentNode.direction] ??= [];
    nodePool.constraints.edges[parentNode.direction]?.push(poolName);

    // Set constraints on edge
    const edgePool = pools.edge[poolName]!;
    if (parentNode.direction === "fromOrTo") {
      if (edgePool.constraints.nodes?.toOrFrom?.length === 2) {
        throw new Error(`Edge ${poolName} already has both nodes defined.`);
      }

      edgePool.constraints.nodes ??= {};
      edgePool.constraints.nodes.toOrFrom ??= [];
      edgePool.constraints.nodes.toOrFrom.push(parentNode.poolName);
    } else {
      edgePool.constraints.nodes ??= {};
      edgePool.constraints.nodes[parentNode.direction] = parentNode.poolName;
    }
  }

  return poolName;
}

function parseEdgeClass(item: Class<Edge>, pools: Pools): PoolName {
  const poolName = randomString();

  pools.edge[poolName] = {
    constraints: {
      class: item,
    }
  };

  return poolName;
}

function parseEdgeInstance(item: Edge, pools: Pools): PoolName {
  const poolName = item.id;

  pools.edge[poolName] = {
    constraints: {
      instance: item,
    }
  };

  return poolName;
}

function parseEdgeQueryItem(item: EdgeQueryItem, pools: Pools): PoolName {
  const poolName = item.name ?? randomString();

  const existingPool = pools.edge[poolName];

  if (existingPool !== undefined) {
    const existingClass = existingPool.constraints.class;

    if (existingClass !== undefined && existingClass !== item.class) {
      if (isClassThatExtends(item.class, existingClass)) {
        // It's more specific
        existingPool.constraints.class = item.class;
      } else if (isClassThatExtends(existingClass, item.class)) {
        // It's more generic, do nothing
      } else {
        // It's a completely different class
        throw new Error(`Edge class mismatch for ${poolName}: ${existingClass} and ${item.class}`);
      }
    }
  }

  pools.edge[poolName] = {
    constraints: {
      class: item.class,
    }
  };

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

export function isSingleItem(input: QueryInput): input is QueryInputItem {
  return (
    !Array.isArray(input) &&
    input.constructor.name !== "Object"
  )
}

export function isNodelike(
  item: Nodelike | Edgelike,
): item is Nodelike {
  return (
    isClassThatExtends(item as Class<any>, Node) ||
    item instanceof Node ||
    item instanceof NodeQueryItem
  );
}

export function isEdgelike(
  item: Nodelike | Edgelike,
): item is Edgelike {
  return (
    isClassThatExtends(item as Class<any>, Edge) ||
    item instanceof Edge ||
    item instanceof EdgeQueryItem
  );
}

export function getOppositeDirection(direction: EdgeDirection): EdgeDirection {
  switch (direction) {
    case "from": return "to";
    case "to": return "from";
    case "fromOrTo": return "fromOrTo";
  }
}

function getOppositePoolType(type: PoolType): PoolType {
  switch (type) {
    case "node": return "edge";
    case "edge": return "node";
    default: return "unknown";
  }
}