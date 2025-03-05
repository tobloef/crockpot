import { parseInput } from "./parse-input.js";
import { createPlan } from "./create-plan.js";
import { executePlan } from "./execute-plan.js";
import { createOutputs } from "./create-outputs.js";
import { deduplicateOutputs } from "./deduplicate-outputs.js";
export function* runQuery(graph, input) {
    const slots = parseInput(input);
    yield* runQueryBySlots(graph, slots);
}
export function* runQueryBySlots(graph, slots) {
    const plan = createPlan(slots, graph);
    const matchesGenerator = executePlan(plan);
    const rawOutputsGenerator = createOutputs(matchesGenerator, slots);
    const deduplicatedOutputGenerator = deduplicateOutputs(rawOutputsGenerator);
    yield* deduplicatedOutputGenerator;
}
//# sourceMappingURL=run-query.js.map