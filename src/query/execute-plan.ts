import type { QuerySlots, SlotName } from "./parse-input.ts";
import type { Graph } from "../graph.ts";
import type { QueryPlan } from "./create-plan.ts";
import type { Node } from "../node/node.ts";
import type { Edge } from "../edge/edge.ts";

export type QueryMatch = Record<SlotName, Node | Edge>;

export function executePlan(
  plan: QueryPlan,
  graph: Graph
): Generator<QueryMatch> {

}