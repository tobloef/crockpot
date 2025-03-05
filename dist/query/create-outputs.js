import { getAllSlots } from "./parse-input.js";
import { assertExhaustive } from "../utils/assert-exhaustive.js";
export function* createOutputs(matchesGenerator, slots) {
    switch (slots.format) {
        case "single":
            yield* createSingleOutputs(matchesGenerator, slots);
            break;
        case "array":
            yield* createArrayOutputs(matchesGenerator, slots);
            break;
        case "object":
            yield* createObjectOutputs(matchesGenerator, slots);
            break;
        default:
            assertExhaustive(slots.format);
    }
}
function* createSingleOutputs(matches, slots) {
    const slot = getAllSlots(slots)[0];
    for (const match of matches) {
        const output = match[slot.name];
        yield output;
    }
}
function* createArrayOutputs(matches, slots) {
    const outputSlots = getOutputSlots(slots);
    for (const match of matches) {
        const output = [];
        for (const slot of outputSlots) {
            for (const key of slot.outputKeys) {
                output[key] = match[slot.name];
            }
        }
        yield output;
    }
}
function* createObjectOutputs(matches, slots) {
    const outputSlots = getOutputSlots(slots);
    for (const match of matches) {
        const output = {};
        for (const slot of outputSlots) {
            for (const key of slot.outputKeys) {
                output[key] = match[slot.name];
            }
        }
        yield output;
    }
}
/** Get all slots that have any output keys. */
function getOutputSlots(slots) {
    const allSlots = getAllSlots(slots);
    const slotsWithOutputKeys = allSlots
        .filter((slot) => slot.outputKeys.length > 0);
    return slotsWithOutputKeys;
}
const outputHashCache = new WeakMap();
export function getOutputHash(output) {
    if (outputHashCache.has(output)) {
        return outputHashCache.get(output);
    }
    let hash;
    if (output.id !== undefined) {
        hash = output.id;
    }
    else {
        hash = Object.values(output)
            .map((item) => item.id)
            .join();
    }
    outputHashCache.set(output, hash);
    return hash;
}
//# sourceMappingURL=create-outputs.js.map