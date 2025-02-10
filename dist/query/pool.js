import { Node } from "../node/node.js";
import { Edge } from "../edge/edge.js";
export const POOL_TYPES = ['node', 'edge', 'unknown'];
export function getPoolByName(poolName, pools) {
    return (pools.node[poolName] ??
        pools.edge[poolName] ??
        pools.unknown[poolName]);
}
export function createPoolGeneratorFunctions(graph, pools) {
    const generatorFunctions = {};
    const nodeGeneratorFunction = () => setToGenerator(graph.indices.allNodes);
    const edgeGeneratorFunction = () => setToGenerator(graph.indices.allEdges);
    const nodeAndEdgeGeneratorFunction = () => combineGenerators(nodeGeneratorFunction(), edgeGeneratorFunction());
    for (const poolName of Object.keys(pools.node)) {
        generatorFunctions[poolName] = nodeGeneratorFunction;
    }
    for (const poolName of Object.keys(pools.edge)) {
        generatorFunctions[poolName] = edgeGeneratorFunction;
    }
    for (const poolName of Object.keys(pools.unknown)) {
        generatorFunctions[poolName] = nodeAndEdgeGeneratorFunction;
    }
    return generatorFunctions;
}
export function createPoolSets(graph, pools) {
    const sets = {};
    for (const poolName of Object.keys(pools.node)) {
        sets[poolName] = [graph.indices.allNodes];
    }
    for (const poolName of Object.keys(pools.edge)) {
        sets[poolName] = [graph.indices.allEdges];
    }
    for (const poolName of Object.keys(pools.unknown)) {
        sets[poolName] = [graph.indices.allNodes, graph.indices.allEdges];
    }
    return sets;
}
export function* permuteSets(sets) {
    const entries = Object.entries(sets);
    const [firstEntry, ...otherEntries] = entries;
    if (firstEntry === undefined) {
        return;
    }
    const [firstKey, firstSets] = firstEntry;
    const otherSets = Object.fromEntries(otherEntries);
    for (const set of firstSets) {
        for (const item of set) {
            if (otherEntries.length === 0) {
                const permutation = { [firstKey]: item };
                yield permutation;
            }
            else {
                const otherPermutations = permuteSets(otherSets);
                for (const otherPermutation of otherPermutations) {
                    const permutation = { [firstKey]: item, ...otherPermutation };
                    yield permutation;
                }
            }
        }
    }
}
export function* permuteGenerators(generatorFunctions) {
    const entries = Object.entries(generatorFunctions);
    const [firstEntry, ...otherEntries] = entries;
    if (firstEntry === undefined) {
        return;
    }
    const [firstKey, firstGeneratorFunction] = firstEntry;
    const otherGeneratorFunctions = Object.fromEntries(otherEntries);
    for (const item of firstGeneratorFunction()) {
        if (otherEntries.length === 0) {
            const permutation = { [firstKey]: item };
            yield permutation;
        }
        else {
            const otherPermutations = permuteGenerators(otherGeneratorFunctions);
            for (const otherPermutation of otherPermutations) {
                const permutation = { [firstKey]: item, ...otherPermutation };
                yield permutation;
            }
        }
    }
}
export function* arrayToGenerator(array) {
    for (const item of array) {
        yield item;
    }
}
export function* setToGenerator(set) {
    for (const item of set) {
        yield item;
    }
}
export function* combineGenerators(...generators) {
    for (const generator of generators) {
        yield* generator;
    }
}
export function countSetPermutations(set) {
    return Object.values(set).reduce((acc, s) => acc * s.reduce((acc, s) => acc * s.size, 1), 1);
}
export function countGeneratorPermutations(generators) {
    return Object.values(generators).reduce((acc, gen) => acc * gen().toArray().length, 1);
}
export function getPoolKeys(pools) {
    return [
        ...Object.keys(pools.node),
        ...Object.keys(pools.edge),
        ...Object.keys(pools.unknown),
    ];
}
//# sourceMappingURL=pool.js.map