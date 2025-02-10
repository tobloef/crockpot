import { isSingleItem, parseInput } from "./parsing.js";
import { addToAlreadyFound, checkIfAlreadyFound, permutationToOutput } from "./output.js";
import { checkConstraints } from "./constraints.js";
import { countGeneratorPermutations, countSetPermutations, createPoolGeneratorFunctions, createPoolSets, getPoolKeys, permuteGenerators, permuteSets } from "./pool.js";
export function* query(graph, input) {
    const pools = parseInput(input);
    const sets = createPoolSets(graph, pools);
    const permutations = permuteSets(sets);
    console.log(`Permutation count: ${countSetPermutations(sets).toLocaleString()}`);
    console.log(`Pools:\n\t${getPoolKeys(pools).join("\n\t")}`);
    const isOutputSingleItem = isSingleItem(input);
    const foundOutputs = new Set();
    for (const permutation of permutations) {
        const output = permutationToOutput(permutation, pools, input, isOutputSingleItem);
        const wasAlreadyFound = checkIfAlreadyFound(output, foundOutputs, isOutputSingleItem);
        if (wasAlreadyFound) {
            continue;
        }
        const passesConstraints = checkConstraints(permutation, pools);
        if (!passesConstraints) {
            continue;
        }
        addToAlreadyFound(output, foundOutputs, isOutputSingleItem);
        yield output;
    }
}
//# sourceMappingURL=query.js.map