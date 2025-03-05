import { getOutputHash } from "./create-outputs.js";
export function* deduplicateOutputs(outputs) {
    const alreadyFoundOutputs = new Set();
    for (const output of outputs) {
        const hash = getOutputHash(output);
        if (alreadyFoundOutputs.has(hash)) {
            continue;
        }
        alreadyFoundOutputs.add(hash);
        yield output;
    }
}
//# sourceMappingURL=deduplicate-outputs.js.map