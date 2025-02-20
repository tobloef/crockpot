import { getAllConnectedSlotNames, getAllSlots, getSlotByName, type QuerySlots, type Slot } from "./parse-input.ts";
import type { Graph } from "../graph.ts";
import { Edge, type EdgeDirection } from "../edge/edge.ts";
import type { Node } from "../node/node.ts";

export type QueryPlan = {
  subqueries: SubqueryPlan[]
};

export type SubqueryPlan = {
  steps: QueryPlanStep[]
};

export type QueryPlanStep = (
  | TraverseStep
  | EnsureConnectionStep
  | IterateIndexStep
);

/**
 * Traverse and visit from an already visited slot to an unvisited slot.
 */
export type TraverseStep = {
  type: "traverse",
  visitedSlot: Slot,
  unvisitedSlot: Slot,
  direction: EdgeDirection,
};


/**
 * Ensure that two already visited slots are connected.
 */
export type EnsureConnectionStep = {
  type: "ensure connection",
  visitedSlot1: Slot,
  visitedSlot2: Slot,
  direction: EdgeDirection,
};

/**
 * Visit all items in an index.
 */
export type IterateIndexStep = {
  type: "iterate index",
  index: Iterable<Node | Edge>,
  matchItem: string,
  unvisitedSlot: Slot,
};

export function createPlan(
  slots: QuerySlots,
  graph: Graph
): QueryPlan {
  let plan: QueryPlan = {
    subqueries: [],
  };

  const disjointSets = getDisjointSets(slots);

  for (const set of disjointSets) {
    const startingPoint = getBestStartingPoint(set, graph);

    plan.subQueries.push({
      slots: set,
      startingPoint,
    });
  }

  return plan;
}

function getDisjointSets(slots: QuerySlots): Set<Slot>[] {
  const allSlots = getAllSlots(slots);

  let disjointSets: Set<Slot>[] = [];

  for (const slot of allSlots) {
    let setWithSlot = disjointSets.find((set) => set.has(slot));

    if (setWithSlot === undefined) {
      setWithSlot = new Set();
      setWithSlot.add(slot);
      disjointSets.push(setWithSlot);
    }

    const connectedSlotNames = getAllConnectedSlotNames(slot);
    const connectedSlots = connectedSlotNames.map((name) => getSlotByName(slots, name)!);

    for (const connectedSlot of connectedSlots) {
      const setWithConnectedSlot = disjointSets.find((set) => set.has(connectedSlot));

      if (setWithConnectedSlot === undefined) {
        setWithSlot.add(connectedSlot);
      } else if (setWithConnectedSlot !== setWithSlot) {
        setWithConnectedSlot.forEach((slot) => setWithSlot.add(slot));
        disjointSets = disjointSets.filter((set) => set !== setWithConnectedSlot);
      }
    }
  }

  return disjointSets;
}

function getBestStartingPoint(slots: Set<Slot>, graph: Graph): StartingPoint {
  // TODO: This is a placeholder implementation.
  const firstSlot = Array.from(slots)[0];

  if (firstSlot === undefined) {
    throw new Error("Got empty set of slots.");
  }

  let allOfTypeIndex: keyof Graph["indices"];

  if (firstSlot.type === "node") {
    allOfTypeIndex = "allNodes";
  } else if (firstSlot.type === "edge") {
    allOfTypeIndex = "allEdges";
  } else {
    // Assuming that unknown-type slots are nodes.
    allOfTypeIndex = "allNodes";
  }

  return {
    slot: firstSlot,
    index: allOfTypeIndex,
  };
}