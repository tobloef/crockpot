import type { QueryInput, QueryOutput, } from "./query.types.ts";
import type { Graph } from "../graph.ts";
import { parseInput, type QuerySlots } from "./parse-input.ts";
import { createPlan } from "./create-plan.ts";
import { executePlan } from "./execute-plan.ts";
import { createOutputs } from "./create-outputs.ts";
import { deduplicateOutputs } from "./deduplicate-outputs.ts";
import { iterableToGenerator } from "../utils/generators.ts";

// TODO: Actually, move this to the graph?
const queries = new WeakSet<Query<any>>();

// TODO: Move into Query class? And make it runnable by slots as well?
export function* query<
  Input extends QueryInput
>(
  graph: Graph,
  input: Input,
): Generator<QueryOutput<Input>> {
  const slots = parseInput(input);
  const plan = createPlan(slots, graph);
  const matchesGenerator = executePlan(plan);
  const rawOutputsGenerator = createOutputs<Input>(matchesGenerator, slots);
  const deduplicatedOutputGenerator = deduplicateOutputs<Input>(rawOutputsGenerator);

  yield* deduplicatedOutputGenerator;
}

export type QueryOptions = {
  cache?: boolean;
}

export class Query<
  Input extends QueryInput
> {
  readonly graph: Graph;
  readonly input: Input;
  options: QueryOptions;

  #addedResults: QueryOutput<Input>[] = [];
  #removedResults: QueryOutput<Input>[] = [];
  #cache?: Set<QueryOutput<Input>>;
  #slots: QuerySlots;

  constructor(
    graph: Graph,
    input: Input,
    options: QueryOptions = {}
  ) {
    this.graph = graph;
    this.input = input;
    this.#slots = parseInput(input);
    this.options = options;

    queries.add(this);
  }

  *results(): Generator<QueryOutput<Input>> {
    if (this.#cache === undefined || !this.options.cache) {
      this.#cache = this.#getNewCache();
    }

    for (const result of this.#cache) {
      yield result;
    }
  }

  *added(): Generator<QueryOutput<Input>> {
    for (const result of this.#addedResults) {
      yield result;
    }

    this.#addedResults = [];
  }

  *removed(): Generator<QueryOutput<Input>> {
    for (const result of this.#removedResults) {
      yield result;
    }

    this.#removedResults = [];
  }

  // TODO: Where should the responsibility of notifying the query be?
  notifyUpdated() {
    const newCache = this.#getNewCache();
    let addedResults = newCache;
    let removedResults = new Set<QueryOutput<Input>>();

    if (this.#cache !== undefined) {
      addedResults = newCache.difference(this.#cache);
      removedResults = this.#cache.difference(newCache);
    }

    this.#addedResults.push(...addedResults);
    this.#removedResults.push(...removedResults);

    this.#cache = newCache;
  }

  #getNewCache(): Set<QueryOutput<Input>> {
    const cache = new Set<QueryOutput<Input>>();
    const generator = query(this.graph, this.input);

    for (const result of generator) {
      cache.add(result);
    }

    return cache;
  }
}