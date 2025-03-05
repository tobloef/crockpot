import { type QuerySlots, type Slot } from "./parse-input.ts";
import type { Graph } from "../graph.ts";
import { Edge, type EdgeDirection } from "../edge/edge.ts";
import { Node } from "../node/node.ts";
export type QueryPlan = {
    subqueries: SubqueryPlan[];
};
export type SubqueryPlan = {
    steps: QueryPlanStep[];
};
export type QueryPlanStep = (TraverseStep | EnsureConnectionStep | IterateIndexStep);
/**
 * Traverse and visit from an already visited slot to an unvisited slot.
 */
export type TraverseStep = {
    type: "traverse";
    visitedSlot: Slot;
    unvisitedSlot: Slot;
    direction: EdgeDirection;
};
/**
 * Ensure that two already visited slots are connected.
 */
export type EnsureConnectionStep = {
    type: "ensure connection";
    visitedSlot1: Slot;
    visitedSlot2: Slot;
    direction: EdgeDirection;
};
/**
 * Visit all items in an index.
 */
export type IterateIndexStep = {
    type: "iterate index";
    index: Iterable<Node | Edge>;
    slotToVisit: Slot;
};
export declare function createPlan(slots: QuerySlots, graph: Graph): QueryPlan;
export type StartingPoint = {
    slot: Slot;
    index: Iterable<Node | Edge>;
    size: number;
};
export declare function getBestStartingPoint(slots: Set<Slot>, graph: Graph): StartingPoint | undefined;
