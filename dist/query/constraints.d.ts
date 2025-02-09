import { Node } from "../node/node.ts";
import { Edge } from "../edge/edge.ts";
import type { PoolName, Pools } from "./pool.ts";
export declare function checkConstraints(permutation: Record<string, Node | Edge>, pools: Pools): boolean;
export declare function checkNodeConstraints(node: Node, poolName: PoolName, permutation: Record<string, Node | Edge>, pools: Pools): boolean;
export declare function checkEdgeConstraints(edge: Edge, poolName: PoolName, permutation: Record<string, Node | Edge>, pools: Pools): boolean;
