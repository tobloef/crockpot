import { Node } from "../node/node.js";
import { Edge } from "../edge/edge.js";
import { isSingleItem } from "./parsing.js";
export function permutationToOutput(permutation, pools, input, isOutputSingleItem) {
    if (isOutputSingleItem) {
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
export function checkIfAlreadyFound(output, foundOutputs, isOutputSingleItem) {
    if (isOutputSingleItem) {
        return foundOutputs.has(output.id);
    }
    else {
        const compositeId = Object.values(output)
            .map((item) => item.id)
            .join();
        return foundOutputs.has(compositeId);
    }
}
export function addToAlreadyFound(output, foundOutputs, isOutputSingleItem) {
    if (isOutputSingleItem) {
        foundOutputs.add(output.id);
    }
    else {
        const compositeId = Object.values(output)
            .map((item) => item.id)
            .join();
        foundOutputs.add(compositeId);
    }
}
//# sourceMappingURL=output.js.map