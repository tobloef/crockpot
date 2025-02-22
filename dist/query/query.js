import { parseInput } from "./parse-input.js";
import { createPlan } from "./create-plan.js";
import { executePlan } from "./execute-plan.js";
import { createOutputs } from "./create-outputs.js";
import { deduplicateOutputs } from "./deduplicate-outputs.js";
import { iterableToGenerator } from "../utils/generators.js";
export function* query(graph, input) {
    const slots = parseInput(input);
    const plan = createPlan(slots, graph);
    const matchesGenerator = executePlan(plan);
    const rawOutputsGenerator = createOutputs(matchesGenerator, slots);
    const deduplicatedOutputGenerator = deduplicateOutputs(rawOutputsGenerator);
    yield* deduplicatedOutputGenerator;
}
//# sourceMappingURL=query.js.map