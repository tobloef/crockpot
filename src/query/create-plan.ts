import type { QuerySlots } from "./parse-input.ts";
import type { Graph } from "../graph.ts";

export type QueryPlan = {

};

export function createPlan(
  slots: QuerySlots,
  graph: Graph
): QueryPlan {
  // NOTE: Identity disjoint sets of the input graph
  //   For every slot, check if it's in one of the sets
  //   If it is, great, this is the set we're going with.
  //   If it is not, add it to a new set.
  //   For every connection is has, check that slot as well.
  //   If the slot is in the same set, great, we're good.
  //   If not, add it to the current set.
  //   If another set has that slot as well, merge the two sets.
}