import { getAllConnectedSlotNames, getAllSlots, getSlotByName } from "./parse-input.js";
import { Edge } from "../edge/edge.js";
import { combineGenerators, iterableToGenerator } from "../utils/generators.js";
export function createPlan(slots, graph) {
    let plan = {
        subqueries: [],
    };
    const disjointSets = getDisjointSets(slots);
    for (const set of disjointSets) {
        const subqueryPlan = {
            steps: [],
        };
        plan.subqueries.push(subqueryPlan);
        const visits = {};
        const startingPoint = getStartingPoint(set, graph);
        subqueryPlan.steps.push({
            type: "iterate index",
            index: startingPoint.index,
            slotToVisit: startingPoint.slot,
        });
        recurseSlotAndConnections(startingPoint.slot, visits, slots, subqueryPlan);
    }
    return plan;
}
function recurseSlotAndConnections(slot, visits, slots, subqueryPlan) {
    let visitsForSlotA = visits[slot.name];
    if (visitsForSlotA === undefined) {
        visitsForSlotA = new Set();
        visits[slot.name] = visitsForSlotA;
    }
    const connections = getConnections(slot);
    for (const connection of connections) {
        const visitedConnectionBetweenTheseTwo = visitsForSlotA.has(connection.b);
        if (visitedConnectionBetweenTheseTwo) {
            continue;
        }
        const slotA = getSlotByName(slots, connection.a);
        const slotB = getSlotByName(slots, connection.b);
        let visitsForSlotB = visits[connection.b];
        if (visitsForSlotB === undefined) {
            subqueryPlan.steps.push({
                type: "traverse",
                visitedSlot: slotA,
                unvisitedSlot: slotB,
                direction: connection.direction,
            });
            visitsForSlotB = new Set();
            visits[connection.b] = visitsForSlotB;
            visitsForSlotB.add(connection.a);
            visitsForSlotA.add(connection.b);
            recurseSlotAndConnections(slotB, visits, slots, subqueryPlan);
        }
        else {
            subqueryPlan.steps.push({
                type: "ensure connection",
                visitedSlot1: slotA,
                visitedSlot2: slotB,
                direction: connection.direction,
            });
            visitsForSlotB.add(connection.a);
            visitsForSlotA.add(connection.b);
        }
    }
}
function getConnections(slot) {
    const connections = [];
    if (slot.type === "node") {
        for (const fromEdge of slot.constraints.edges?.from ?? []) {
            const direction = "from";
            connections.push({
                a: slot.name,
                b: fromEdge,
                direction,
            });
        }
        for (const toEdge of slot.constraints.edges?.to ?? []) {
            const direction = "to";
            connections.push({
                a: slot.name,
                b: toEdge,
                direction,
            });
        }
        for (const fromOrToEdge of slot.constraints.edges?.fromOrTo ?? []) {
            const direction = "fromOrTo";
            connections.push({
                a: slot.name,
                b: fromOrToEdge,
                direction,
            });
        }
    }
    else if (slot.type === "edge") {
        if (slot.constraints.nodes?.to !== undefined) {
            const direction = "to";
            connections.push({
                a: slot.name,
                b: slot.constraints.nodes.to,
                direction,
            });
        }
        if (slot.constraints.nodes?.from !== undefined) {
            const direction = "from";
            connections.push({
                a: slot.name,
                b: slot.constraints.nodes.from,
                direction,
            });
        }
        for (const fromOrToNode of slot.constraints.nodes?.fromOrTo ?? []) {
            const direction = "fromOrTo";
            connections.push({
                a: slot.name,
                b: fromOrToNode,
                direction,
            });
        }
    }
    return connections;
}
function getDisjointSets(slots) {
    const allSlots = getAllSlots(slots);
    let disjointSets = [];
    for (const slot of allSlots) {
        let setWithSlot = disjointSets.find((set) => set.has(slot));
        if (setWithSlot === undefined) {
            setWithSlot = new Set();
            setWithSlot.add(slot);
            disjointSets.push(setWithSlot);
        }
        const connectedSlotNames = getAllConnectedSlotNames(slot);
        const connectedSlots = connectedSlotNames.map((name) => getSlotByName(slots, name));
        for (const connectedSlot of connectedSlots) {
            const setWithConnectedSlot = disjointSets.find((set) => set.has(connectedSlot));
            if (setWithConnectedSlot === undefined) {
                setWithSlot.add(connectedSlot);
            }
            else if (setWithConnectedSlot !== setWithSlot) {
                setWithConnectedSlot.forEach((slot) => setWithSlot.add(slot));
                disjointSets = disjointSets.filter((set) => set !== setWithConnectedSlot);
            }
        }
    }
    return disjointSets;
}
function getStartingPoint(slots, graph) {
    // TODO: This is a placeholder implementation.
    const firstSlot = Array.from(slots)[0];
    if (firstSlot === undefined) {
        throw new Error("Got empty set of slots.");
    }
    let allOfTypeIndex;
    if (firstSlot.type === "node") {
        allOfTypeIndex = graph.indices.allNodes;
    }
    else if (firstSlot.type === "edge") {
        allOfTypeIndex = graph.indices.allEdges;
    }
    else {
        allOfTypeIndex = combineGenerators(iterableToGenerator(graph.indices.allNodes), iterableToGenerator(graph.indices.allEdges));
    }
    return {
        slot: firstSlot,
        index: allOfTypeIndex,
    };
}
//# sourceMappingURL=create-plan.js.map