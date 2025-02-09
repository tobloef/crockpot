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
    for (const foundOutput of foundOutputs) {
        if (isOutputSingleItem) {
            if (foundOutput === output) {
                return true;
            }
            else {
                continue;
            }
        }
        const outputEntries = Object.entries(output);
        const foundEntries = Object.entries(foundOutput);
        if (foundEntries.length !== outputEntries.length) {
            continue;
        }
        let wasMatch = true;
        for (let i = 0; i < foundEntries.length; i++) {
            const [foundKey, foundValue] = foundEntries[i];
            const [outputKey, outputValue] = outputEntries[i];
            if (foundKey !== outputKey) {
                wasMatch = false;
                break;
            }
            if (foundValue !== outputValue) {
                wasMatch = false;
                break;
            }
        }
        if (wasMatch) {
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=output.js.map