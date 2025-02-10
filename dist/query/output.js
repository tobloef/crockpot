import { Node } from "../node/node.js";
import { Edge } from "../edge/edge.js";
import { isSingleItem } from "./parsing.js";
export function permutationToOutput(permutation, pools, input) {
    if (isSingleItem(input)) {
        const onlyPoolName = (Object.keys(pools.node)[0] ??
            Object.keys(pools.edge)[0] ??
            Object.keys(pools.unknown)[0]);
        return permutation[onlyPoolName];
    }
    else if (Array.isArray(input)) {
        const output = [];
        const allPools = { ...pools.node, ...pools.edge, ...pools.unknown };
        for (const [poolName, pool] of Object.entries(allPools)) {
            const item = permutation[poolName];
            for (const outputKey of pool.outputKeys) {
                output[outputKey] = item;
            }
        }
        return output;
    }
    else {
        const output = {};
        const allPools = { ...pools.node, ...pools.edge, ...pools.unknown };
        for (const [poolName, pool] of Object.entries(allPools)) {
            const item = permutation[poolName];
            for (const outputKey of pool.outputKeys) {
                output[outputKey] = item;
            }
        }
        return output;
    }
}
export function checkIfAlreadyFound(output, foundOutputs) {
    const isOutputSingleItem = isSingleItem(output);
    if (isOutputSingleItem) {
        if (foundOutputs[0] === undefined) {
            return false;
        }
        return foundOutputs[0].has(output);
    }
    else {
        for (const [key, value] of Object.entries(output)) {
            if (foundOutputs[key] === undefined) {
                return false;
            }
            if (!foundOutputs[key].has(value)) {
                return false;
            }
        }
        return true;
    }
}
export function addToAlreadyFound(output, foundOutputs) {
    const isOutputSingleItem = isSingleItem(output);
    if (isOutputSingleItem) {
        if (foundOutputs[0] === undefined) {
            foundOutputs[0] = new Set();
        }
        foundOutputs[0].add(output);
    }
    else {
        for (const [key, value] of Object.entries(output)) {
            if (foundOutputs[key] === undefined) {
                foundOutputs[key] = new Set();
            }
            foundOutputs[key].add(value);
        }
    }
}
//# sourceMappingURL=output.js.map