import { Node } from "../node/node.ts";
import type { Class } from "../utils/class.ts";
import { Edge } from "../edge/edge.ts";
import type { Graph } from "../graph.ts";
export type PoolName = string;
export type PoolType = keyof Pools;
export declare const POOL_TYPES: ["node", "edge", "unknown"];
export type Pools = {
    node: Record<PoolName, NodePool>;
    edge: Record<PoolName, EdgePool>;
    unknown: Record<PoolName, NodePool | EdgePool>;
};
export type NodePool = {
    constraints: {
        instance?: Node;
        class?: Class<Node>;
        edges?: {
            from?: PoolName[];
            to?: PoolName[];
            fromOrTo?: PoolName[];
        };
    };
    outputKeys: string[] | number[];
};
export type EdgePool = {
    constraints: {
        instance?: Edge;
        class?: Class<Edge>;
        nodes?: {
            to?: PoolName;
            from?: PoolName;
            toOrFrom?: PoolName[];
        };
    };
    outputKeys: string[] | number[];
};
export type GeneratorFunction<T> = () => Generator<T>;
export type PoolGeneratorFunctions = Record<PoolName, GeneratorFunction<any>>;
export type PermutationFromPoolGeneratorFunctions<Generators extends PoolGeneratorFunctions> = {
    [Key in keyof Generators]: (Generators[Key] extends GeneratorFunction<infer T> ? T : never);
};
export declare function getPoolByName(poolName: PoolName, pools: Pools): NodePool | EdgePool | undefined;
export declare function createPoolGeneratorFunctions(graph: Graph, pools: Pools): Record<PoolName, GeneratorFunction<Node | Edge>>;
export declare function permuteGenerators<GenFuncs extends PoolGeneratorFunctions>(generatorFunctions: GenFuncs): Generator<PermutationFromPoolGeneratorFunctions<GenFuncs>>;
export declare function arrayToGenerator<T>(array: T[]): Generator<T>;
export declare function setToGenerator<T>(set: Set<T>): Generator<T>;
export declare function combineGenerators<T>(...generators: Generator<T>[]): Generator<T>;
export declare function countPermutations(generators: PoolGeneratorFunctions): number;
export declare function getPoolKeys(pools: Pools): string[];
