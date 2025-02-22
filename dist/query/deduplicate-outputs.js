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
function getOutputHash(output) {
    if (output.id !== undefined) {
        return output.id;
    }
    const hash = Object.values(output)
        .map((item) => item.id)
        .join();
    return hash;
}
//# sourceMappingURL=deduplicate-outputs.js.map