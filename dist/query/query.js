import { parseInput } from "./parsing.js";
import { addToAlreadyFound, checkIfAlreadyFound, permutationToOutput } from "./output.js";
import { checkConstraints } from "./constraints.js";
import { countPermutations, createPoolGeneratorFunctions, getPoolKeys, permuteGenerators } from "./pool.js";
export function* query(graph, input) {
    const pools = parseInput(input);
    const generators = createPoolGeneratorFunctions(graph, pools);
    const permutations = permuteGenerators(generators);
    console.log(`Permutation count: ${countPermutations(generators).toLocaleString()}`);
    console.log(`Pools:\n\t${getPoolKeys(pools).join("\n\t")}`);
    const results = [];
    const foundOutputs = {};
    for (const permutation of permutations) {
        const output = permutationToOutput(permutation, pools, input);
        const wasAlreadyFound = checkIfAlreadyFound(output, foundOutputs);
        if (wasAlreadyFound) {
            continue;
        }
        const passesConstraints = checkConstraints(permutation, pools);
        if (!passesConstraints) {
            continue;
        }
        addToAlreadyFound(output, foundOutputs);
        yield output;
    }
}
//# sourceMappingURL=query.js.map