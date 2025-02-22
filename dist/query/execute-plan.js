import { getOppositeDirection } from "./parse-input.js";
import { Node } from "../node/node.js";
import { Edge } from "../edge/edge.js";
import { assertExhaustive } from "../utils/assert-exhaustive.js";
import { isClassThatExtends } from "../utils/class.js";
const BREAK = true;
export function* executePlan(plan) {
    const subqueryGeneratorFunctions = plan.subqueries.map((subquery) => {
        return () => executeSubqueryPlan(subquery);
    });
    yield* permuteGeneratorFunctions(subqueryGeneratorFunctions);
}
function* executeSubqueryPlan(subqueryPlan) {
    const { steps, } = subqueryPlan;
    const [nextStep, ...remainingSteps] = steps;
    if (nextStep === undefined) {
        return;
    }
    const match = {};
    const edgeLockedInDirections = {};
    yield* executeSteps(nextStep, remainingSteps, match, edgeLockedInDirections);
}
function* executeSteps(step, nextSteps, match, edgeLockedInDirections) {
    switch (step.type) {
        case "traverse": {
            yield* executeTraverseStep(step, nextSteps, match, edgeLockedInDirections);
            break;
        }
        case "ensure connection": {
            yield* executeEnsureConnectionStep(step, nextSteps, match, edgeLockedInDirections);
            break;
        }
        case "iterate index": {
            yield* executeIterateIndexStep(step, nextSteps, match, edgeLockedInDirections);
            break;
        }
        default: {
            assertExhaustive(step);
        }
    }
}
function* executeTraverseStep(step, nextSteps, match, edgeLockedInDirections) {
    const { visitedSlot, unvisitedSlot } = step;
    let { direction } = step;
    const visitedItem = match[visitedSlot.name];
    if (visitedItem === undefined) {
        throw new Error(`The slot "${visitedSlot.name}" was not visited.`);
    }
    if (visitedItem instanceof Node) {
        if (direction === "from" || direction === "fromOrTo") {
            for (const fromEdge of visitedItem.edges.from) {
                edgeLockedInDirections[fromEdge.id] = "from";
                yield* traverseTo(fromEdge, unvisitedSlot, match, nextSteps, edgeLockedInDirections);
            }
        }
        if (direction === "to" || direction === "fromOrTo") {
            for (const toEdge of visitedItem.edges.to) {
                edgeLockedInDirections[toEdge.id] = "to";
                yield* traverseTo(toEdge, unvisitedSlot, match, nextSteps, edgeLockedInDirections);
            }
        }
    }
    else if (visitedItem instanceof Edge) {
        const edgeLockedInDirection = edgeLockedInDirections[visitedItem.id];
        if (direction === "fromOrTo" && edgeLockedInDirection !== undefined) {
            direction = getOppositeDirection(edgeLockedInDirection);
        }
        if (direction === "from" || direction === "fromOrTo") {
            yield* traverseTo(visitedItem.nodes.from, unvisitedSlot, match, nextSteps, edgeLockedInDirections);
        }
        if (direction === "to" || direction === "fromOrTo") {
            yield* traverseTo(visitedItem.nodes.to, unvisitedSlot, match, nextSteps, edgeLockedInDirections);
        }
    }
    else {
        assertExhaustive(visitedItem);
    }
}
function* traverseTo(unvisitedItem, unvisitedSlot, match, nextSteps, edgeLockedInDirections) {
    if (unvisitedItem === undefined) {
        return;
    }
    const isOk = checkIsolatedConstraints(unvisitedItem, unvisitedSlot);
    if (!isOk) {
        return;
    }
    // Now it's been visited
    match[unvisitedSlot.name] = unvisitedItem;
    const [nextStep, ...remainingSteps] = nextSteps;
    if (nextStep === undefined) {
        yield match;
    }
    else {
        yield* executeSteps(nextStep, remainingSteps, match, edgeLockedInDirections);
    }
}
function* executeEnsureConnectionStep(step, nextSteps, match, edgeLockedInDirections) {
    const { visitedSlot1, visitedSlot2, direction } = step;
    let node;
    let edge;
    let relativeDirection;
    if (visitedSlot1.type === "node" && visitedSlot2.type === "edge") {
        node = match[visitedSlot1.name];
        edge = match[visitedSlot2.name];
        relativeDirection = getOppositeDirection(direction);
    }
    else if (visitedSlot1.type === "edge" && visitedSlot2.type === "node") {
        edge = match[visitedSlot1.name];
        node = match[visitedSlot2.name];
        relativeDirection = direction;
    }
    else {
        throw new Error(`Items of identical types cannot be connected.`);
    }
    if (relativeDirection === "from") {
        const isOk = edge.nodes.from === node;
        if (!isOk) {
            return;
        }
    }
    else if (relativeDirection === "to") {
        const isOk = edge.nodes.to === node;
        if (!isOk) {
            return;
        }
    }
    else if (relativeDirection === "fromOrTo") {
        const isOk = edge.nodes.from === node || edge.nodes.to === node;
        if (!isOk) {
            return;
        }
    }
    else {
        assertExhaustive(relativeDirection);
    }
    const [nextStep, ...remainingSteps] = nextSteps;
    if (nextStep === undefined) {
        yield match;
    }
    else {
        yield* executeSteps(nextStep, remainingSteps, match, edgeLockedInDirections);
    }
}
function* executeIterateIndexStep(step, nextSteps, match, edgeLockedInDirections) {
    const { slotToVisit, index } = step;
    const [nextStep, ...remainingSteps] = nextSteps;
    for (const item of index) {
        const isOk = checkIsolatedConstraints(item, slotToVisit);
        if (!isOk) {
            continue;
        }
        // Now it's been visited
        match[slotToVisit.name] = item;
        if (nextStep === undefined) {
            yield match;
        }
        else {
            yield* executeSteps(nextStep, remainingSteps, match, edgeLockedInDirections);
        }
    }
}
function checkIsolatedConstraints(item, slot) {
    if (slot.type === "node") {
        if (!(item instanceof Node)) {
            return false;
        }
        if (slot.constraints.instance !== undefined &&
            item !== slot.constraints.instance) {
            return false;
        }
        if (slot.constraints.class !== undefined &&
            !isClassThatExtends(item.constructor, slot.constraints.class)) {
            return false;
        }
    }
    if (slot.type === "edge") {
        if (!(item instanceof Edge)) {
            return false;
        }
        if (slot.constraints.instance !== undefined &&
            item !== slot.constraints.instance) {
            return false;
        }
        if (slot.constraints.class !== undefined &&
            !isClassThatExtends(item.constructor, slot.constraints.class)) {
            return false;
        }
    }
    return true;
}
function* permuteGeneratorFunctions(generatorFunctions) {
    const [first, ...rest] = generatorFunctions;
    if (first === undefined) {
        yield {};
        return;
    }
    for (const firstMatch of first()) {
        for (const restMatch of permuteGeneratorFunctions(rest)) {
            yield {
                ...firstMatch,
                ...restMatch,
            };
        }
    }
}
//# sourceMappingURL=execute-plan.js.map