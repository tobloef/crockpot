import {
  getAllConnectedSlotNames,
  getAllSlots,
  getSlotByName,
  type QuerySlots,
  type Slot,
  type SlotName,
} from "./parse-input.ts";
import type { Graph } from "../graph.ts";
import {
  Edge,
  type EdgeDirection,
} from "../edge/edge.ts";
import { Node } from "../node/node.ts";
import {
  combineGenerators,
  iterableToGenerator,
} from "../utils/generators.ts";
import { assertExhaustive } from "../utils/assert-exhaustive.ts";

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
  slotToVisit: Slot,
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
    const subqueryPlan: SubqueryPlan = {
      steps: [],
    };
    plan.subqueries.push(subqueryPlan);

    const visits: Record<SlotName, Set<SlotName>> = {};

    const startingPoint = getBestStartingPoint(set, graph);

    if (startingPoint === undefined) {
      continue;
    }

    subqueryPlan.steps.push({
      type: "iterate index",
      index: startingPoint.index,
      slotToVisit: startingPoint.slot,
    });

    recurseSlotAndConnections(startingPoint.slot, visits, slots, subqueryPlan);
  }

  return plan;
}

function recurseSlotAndConnections(
  slot: Slot,
  visits: Record<SlotName, Set<SlotName>>,
  slots: QuerySlots,
  subqueryPlan: SubqueryPlan,
) {
  let visitsForSlotA = visits[slot.name];
  if (visitsForSlotA === undefined) {
    visitsForSlotA = new Set<SlotName>();
    visits[slot.name] = visitsForSlotA;
  }

  const connections = getConnections(slot);

  for (const connection of connections) {
    const visitedConnectionBetweenTheseTwo = visitsForSlotA.has(connection.b);

    if (visitedConnectionBetweenTheseTwo) {
      continue;
    }

    const slotA = getSlotByName(slots, connection.a)!;
    const slotB = getSlotByName(slots, connection.b)!;

    let visitsForSlotB = visits[connection.b];

    if (visitsForSlotB === undefined) {
      subqueryPlan.steps.push({
        type: "traverse",
        visitedSlot: slotA,
        unvisitedSlot: slotB,
        direction: connection.direction,
      });

      visitsForSlotB = new Set<SlotName>();
      visits[connection.b] = visitsForSlotB;

      visitsForSlotB.add(connection.a);
      visitsForSlotA.add(connection.b);

      recurseSlotAndConnections(slotB, visits, slots, subqueryPlan);
    } else {
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

function getConnections(
  slot: Slot,
) {
  const connections: Array<{
    a: SlotName,
    b: SlotName,
    direction: EdgeDirection,
  }> = [];

  if (slot.type === "node") {
    for (const fromEdge of slot.constraints.edges?.from ?? []) {
      const direction: EdgeDirection = "from";
      connections.push({
        a: slot.name,
        b: fromEdge,
        direction,
      });
    }

    for (const toEdge of slot.constraints.edges?.to ?? []) {
      const direction: EdgeDirection = "to";
      connections.push({
        a: slot.name,
        b: toEdge,
        direction,
      });
    }

    for (const fromOrToEdge of slot.constraints.edges?.fromOrTo ?? []) {
      const direction: EdgeDirection = "fromOrTo";
      connections.push({
        a: slot.name,
        b: fromOrToEdge,
        direction,
      });
    }
  } else if (slot.type === "edge") {
    if (slot.constraints.nodes?.to !== undefined) {
      const direction: EdgeDirection = "to";
      connections.push({
        a: slot.name,
        b: slot.constraints.nodes.to,
        direction,
      });
    }

    if (slot.constraints.nodes?.from !== undefined) {
      const direction: EdgeDirection = "from";
      connections.push({
        a: slot.name,
        b: slot.constraints.nodes.from,
        direction,
      });
    }

    for (const fromOrToNode of slot.constraints.nodes?.fromOrTo ?? []) {
      const direction: EdgeDirection = "fromOrTo";
      connections.push({
        a: slot.name,
        b: fromOrToNode,
        direction,
      });
    }
  }

  return connections;
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

export type StartingPoint = {
  slot: Slot,
  index: Iterable<Node | Edge>,
  size: number,
};

export function getBestStartingPoint(
  slots: Set<Slot>,
  graph: Graph
): StartingPoint | undefined {
  const potentialStartingPoints: StartingPoint[] = [];

  for (const slot of slots) {
    potentialStartingPoints.push(
      getStartingPointForSlot(slot, graph)
    );
  }

  const sortedStartingPoints = potentialStartingPoints.toSorted(
    (a, b) => a.size - b.size
  );

  const smallestStartingPoint = sortedStartingPoints[0];

  return smallestStartingPoint;
}

function getStartingPointForSlot(
  slot: Slot,
  graph: Graph
): StartingPoint {
  switch (slot.type) {
    case "node": {
      if (slot.constraints.instance !== undefined) {
        return {
          slot,
          index: [slot.constraints.instance],
          size: 1,
        }
      }

      const index = graph.indices.nodesByType.get(
        slot.constraints.class ?? Node
      );

      return {
        slot,
        index: index ?? [],
        size: index?.size ?? 0,
      };
    }
    case "edge": {
      if (slot.constraints.instance !== undefined) {
        return {
          slot,
          index: [slot.constraints.instance],
          size: 1,
        }
      }

      const index = graph.indices.edgesByType.get(
        slot.constraints.class ?? Edge
      );

      return {
        slot,
        index: index ?? [],
        size: index?.size ?? 0,
      };
    }
    case "unknown": {
      const allNodes = graph.indices.nodesByType.get(Node);
      const allEdges = graph.indices.edgesByType.get(Edge);
      const allItems = combineGenerators<Node | Edge>(
        iterableToGenerator(allNodes ?? []),
        iterableToGenerator(allEdges ?? []),
      );

      return {
        slot,
        index: allItems,
        size: (allNodes?.size ?? 0) + (allEdges?.size ?? 0),
      }
    }
    default: {
      assertExhaustive(slot);
    }
  }
}


