import type { QueryInput, QueryOutput } from "./query.types.ts";
import { Node } from "../node/node.ts";
import { Edge } from "../edge/edge.ts";
import type { Pools } from "./pool.ts";
export declare function permutationToOutput<Input extends QueryInput>(permutation: Record<string, Node | Edge>, pools: Pools, input: Input): QueryOutput<Input>;
export declare function checkIfAlreadyFound<Input extends QueryInput>(output: QueryOutput<Input>, foundOutputs: QueryOutput<Input>[]): boolean;
