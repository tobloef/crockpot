import { Node } from "../node/node.ts";
import { Edge } from "../edge/edge.ts";
import type { EdgePool, NodePool, PoolName, Pools } from "./pool.ts";

export function checkConstraints(
  permutation: Record<string, Node | Edge>,
  pools: Pools,
): boolean {
  for (const [poolName, item] of Object.entries(permutation)) {
    const passesConstraints = item instanceof Node
      ? checkNodeConstraints(item, poolName, permutation, pools)
      : checkEdgeConstraints(item, poolName, permutation, pools);

    if (!passesConstraints) {
      return false
    }
  }

  return true;
}

export function checkNodeConstraints(
  node: Node,
  poolName: PoolName,
  permutation: Record<string, Node | Edge>,
  pools: Pools,
): boolean {
  const pool = pools.node[poolName] ?? (pools.unknown[poolName] as NodePool | undefined);

  if (pool === undefined) {
    return false;
  }

  if (pool.constraints.instance !== undefined) {
    if (pool.constraints.instance !== node) {
      return false;
    }
  }

  if (pool.constraints.class !== undefined) {
    if (!(node instanceof pool.constraints.class)) {
      return false;
    }
  }

  if (pool.constraints.edges?.from !== undefined) {
    for (const edgePoolName of pool.constraints.edges.from) {
      const edge = permutation[edgePoolName];

      if (!(edge instanceof Edge)) {
        return false;
      }

      if (!node.edges.from.has(edge)) {
        return false;
      }
    }
  }

  if (pool.constraints.edges?.to !== undefined) {
    for (const edgePoolName of pool.constraints.edges.to) {
      const edge = permutation[edgePoolName];

      if (!(edge instanceof Edge)) {
        return false;
      }

      if (!node.edges.to.has(edge)) {
        return false;
      }
    }
  }

  if (pool.constraints.edges?.fromOrTo !== undefined) {
    for (const edgePoolName of pool.constraints.edges.fromOrTo) {
      const edge = permutation[edgePoolName];

      if (!(edge instanceof Edge)) {
        return false;
      }

      if (!node.edges.from.has(edge) && !node.edges.to.has(edge)) {
        return false;
      }
    }
  }

  return true;
}

export function checkEdgeConstraints(
  edge: Edge,
  poolName: PoolName,
  permutation: Record<string, Node | Edge>,
  pools: Pools,
): boolean {
  const pool = pools.edge[poolName] ?? (pools.unknown[poolName] as EdgePool | undefined);

  if (pool === undefined) {
    return false;
  }

  if (pool.constraints.instance !== undefined) {
    if (pool.constraints.instance !== edge) {
      return false;
    }
  }

  if (pool.constraints.class !== undefined) {
    if (!(edge instanceof pool.constraints.class)) {
      return false;
    }
  }

  if (pool.constraints.nodes?.from !== undefined) {
    const fromNode = permutation[pool.constraints.nodes.from];

    if (!(fromNode instanceof Node)) {
      return false;
    }

    if (edge.nodes.from !== fromNode) {
      return false;
    }
  }

  if (pool.constraints.nodes?.to !== undefined) {
    const toNode = permutation[pool.constraints.nodes.to];

    if (!(toNode instanceof Node)) {
      return false;
    }

    if (edge.nodes.to !== toNode) {
      return false;
    }
  }

  if (pool.constraints.nodes?.toOrFrom !== undefined) {
    const [first, second] = pool.constraints.nodes.toOrFrom;

    const firstNode = first !== undefined
      ? permutation[first]
      : undefined;
    const secondNode = second !== undefined
      ? permutation[second]
      : undefined;


    if (firstNode === undefined) {
      throw new Error("Attempted to check edge toOrFrom constraints with empty array.");
    }

    if (!(firstNode instanceof Node)) {
      throw new Error(`Attempted to check edge toOrFrom constraints with non-Node item: ${firstNode}`);
    }

    if (secondNode !== undefined && !(secondNode instanceof Node)) {
      throw new Error(`Attempted to check edge toOrFrom constraints with non-Node item: ${secondNode}`);
    }

    if (secondNode === undefined) {
      if (edge.nodes.from !== firstNode && edge.nodes.to !== firstNode) {
        return false;
      }
    } else {
      if (
        (edge.nodes.from !== firstNode || edge.nodes.to !== secondNode) &&
        (edge.nodes.from !== secondNode || edge.nodes.to !== firstNode)
      ) {
        return false;
      }
    }
  }

  return true;
}
