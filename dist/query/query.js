import { parseInput } from "./parse-input.js";
import { createPlan } from "./create-plan.js";
import { executePlan } from "./execute-plan.js";
import { createOutputs } from "./create-outputs.js";
import { deduplicateOutputs } from "./deduplicate-outputs.js";
import { iterableToGenerator } from "../utils/generators.js";
export function* query(graph, input) {
    // TODO: Remove superfluous array conversions
    const slots = parseInput(input);
    const plan = createPlan(slots, graph);
    const matches = executePlan(plan).toArray();
    const matchesGenerator = iterableToGenerator(matches);
    const rawOutputs = createOutputs(matchesGenerator, slots).toArray();
    const rawOutputsGenerator = iterableToGenerator(rawOutputs);
    const deduplicatedOutput = deduplicateOutputs(rawOutputsGenerator).toArray();
    const deduplicatedOutputGenerator = iterableToGenerator(deduplicatedOutput);
    yield* deduplicatedOutputGenerator;
}
//# sourceMappingURL=query.js.map