import type { Slot, SlotName } from "./parse-input.ts";
import type { Graph } from "../graph.ts";
import type { EnsureConnectionStep, IterateIndexStep, QueryPlan, QueryPlanStep, SubqueryPlan, TraverseStep } from "./create-plan.ts";
import { Node } from "../node/node.ts";
import { Edge } from "../edge/edge.ts";
import { assertExhaustive } from "../utils/assert-exhaustive.ts";
import { type Class, isClassThatExtends } from "../utils/class.ts";

export type QueryMatch = Record<SlotName, Node | Edge>;

export function executePlan(
  plan: QueryPlan,
  graph: Graph
): Generator<QueryMatch> {
  const subqueryGeneratorFunctions = plan.subqueries.map((subquery) => {
    return () => executeSubqueryPlan(subquery, graph)
  });

  return permuteGeneratorFunctions(subqueryGeneratorFunctions)
}

function* executeSubqueryPlan(
  subqueryPlan: SubqueryPlan,
  graph: Graph,
): Generator<QueryMatch> {
  const {
    steps,
  } = subqueryPlan;

  const [nextStep, ...remainingSteps] = steps;

  if (nextStep === undefined) {
    return;
  }

  const match: QueryMatch = {};

  yield* executeSteps(nextStep, remainingSteps, match);
}

function* executeSteps(
  step: QueryPlanStep,
  nextSteps: QueryPlanStep[],
  match: QueryMatch,
): Generator<QueryMatch> {
  switch (step.type) {
    case "traverse": {
      yield* executeTraverseStep(step, nextSteps, match);
      break;
    }
    case "ensure connection": {
      yield* executeEnsureConnectionStep(step, nextSteps, match);
      break;
    }
    case "iterate index": {
      yield* executeIterateIndexStep(step, nextSteps, match);
      break;
    }
    default: {
      assertExhaustive(step);
    }
  }
}

function* executeTraverseStep(
  step: TraverseStep,
  nextSteps: QueryPlanStep[],
  match: QueryMatch,
): Generator<QueryMatch> {
  const { from, to, direction } = step;

  const fromItem = match[from.name];

  if (fromItem === undefined) {
    return;
  }

  if (fromItem instanceof Node) {
    if (direction === "from" || direction === "fromOrTo") {
      for (const fromEdge of fromItem.edges.from) {
        yield* traverseTo(fromEdge, to, match, nextSteps);
      }
    }

    if (direction === "to" || direction === "fromOrTo") {
      for (const toEdge of fromItem.edges.to) {
        yield* traverseTo(toEdge, to, match, nextSteps);
      }
    }
  } else if (fromItem instanceof Edge) {
    if (direction === "from" || direction === "fromOrTo") {
      yield* traverseTo(fromItem.nodes.from, to, match, nextSteps);
    }

    if (direction === "to" || direction === "fromOrTo") {
      yield* traverseTo(fromItem.nodes.to, to, match, nextSteps);
    }
  } else {
    assertExhaustive(fromItem);
  }
}

function* traverseTo(
  item: Node | Edge | undefined,
  slot: Slot,
  match: QueryMatch,
  nextSteps: QueryPlanStep[],
): Generator<QueryMatch> {
  if (item === undefined) {
    return;
  }

  const passesConstraints = checkIsolatedConstraints(item, slot);

  if (!passesConstraints) {
    return;
  }

  match[slot.name] = item;

  const [nextStep, ...remainingSteps] = nextSteps;

  if (nextStep === undefined) {
    yield match;
  } else {
    yield* executeSteps(nextStep, remainingSteps, match);
  }
}

function* executeEnsureConnectionStep(
  step: EnsureConnectionStep,
  nextSteps: QueryPlanStep[],
  match: QueryMatch,
): Generator<QueryMatch> {
  const { from, to } = step;
}

function* executeIterateIndexStep(
  step: IterateIndexStep,
  nextSteps: QueryPlanStep[],
  match: QueryMatch,
): Generator<QueryMatch> {
  const { slot, index, matchItem } = step;

  const [nextStep, ...remainingSteps] = nextSteps;

  for (const item of index) {
    const passesConstraints = checkIsolatedConstraints(item, slot);

    if (!passesConstraints) {
      continue;
    }

    match[matchItem] = item;

    if (nextStep === undefined) {
      yield match;
    } else {
      yield* executeSteps(nextStep, remainingSteps, match);
    }
  }
}

function checkIsolatedConstraints(
  item: Node | Edge,
  slot: Slot,
): boolean {
  if (slot.type === "node") {
    if (!(item instanceof Node)) {
      return false;
    }

    if (
      slot.constraints.instance !== undefined &&
      item !== slot.constraints.instance
    ) {
      return false;
    }

    if (
      slot.constraints.class !== undefined &&
      !isClassThatExtends(
        item.constructor as Class<Node>,
        slot.constraints.class
      )
    ) {
      return false;
    }
  }

  if (slot.type === "edge") {
    if (!(item instanceof Edge)) {
      return false;
    }

    if (
      slot.constraints.instance !== undefined &&
      item !== slot.constraints.instance
    ) {
      return false;
    }

    if (
      slot.constraints.class !== undefined &&
      !isClassThatExtends(
        item.constructor as Class<Edge>,
        slot.constraints.class
      )
    ) {
      return false;
    }
  }

  return true;
}

function* permuteGeneratorFunctions(
  generatorFunctions: (() => Generator<QueryMatch>)[]
): Generator<QueryMatch> {
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
