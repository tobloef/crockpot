import type { Edgelike, Nodelike, QueryInput, QueryInputItem } from "./query.types.ts";
import { type Pools } from "./pool.ts";
import { type EdgeDirection } from "../edge/edge.ts";
export declare function parseInput(input: QueryInput): Pools;
export declare function isSingleItem(input: QueryInput): input is QueryInputItem;
export declare function isNodelike(item: Nodelike | Edgelike): item is Nodelike;
export declare function isEdgelike(item: Nodelike | Edgelike): item is Edgelike;
export declare function getOppositeDirection(direction: EdgeDirection): EdgeDirection;
