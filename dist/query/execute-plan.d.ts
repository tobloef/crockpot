import { type SlotName } from "./parse-input.ts";
import type { QueryPlan } from "./create-plan.ts";
import { Node } from "../node/node.ts";
import { Edge } from "../edge/edge.ts";
export type QueryMatch = Record<SlotName, Node | Edge>;
export declare function executePlan(plan: QueryPlan): Generator<QueryMatch>;
