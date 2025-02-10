import type { QueryInput, QueryOutput } from "./query.types.ts";
import { Node } from "../node/node.ts";
import { Edge } from "../edge/edge.ts";
import type { Pools } from "./pool.ts";
export declare function permutationToOutput<Input extends QueryInput>(permutation: Record<string, Node | Edge>, pools: Pools, input: Input, isOutputSingleItem: boolean): QueryOutput<Input>;
export type FoundOutputs = Set<string>;
export declare function checkIfAlreadyFound<Input extends QueryInput>(output: QueryOutput<Input>, foundOutputs: FoundOutputs, isOutputSingleItem: boolean): boolean;
export declare function addToAlreadyFound<Input extends QueryInput>(output: QueryOutput<Input>, foundOutputs: FoundOutputs, isOutputSingleItem: boolean): void;
