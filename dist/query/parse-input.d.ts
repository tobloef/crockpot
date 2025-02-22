import { Node } from "../node/node.ts";
import { type Class } from "../utils/class.ts";
import { Edge, type EdgeDirection } from "../edge/edge.ts";
import type { Edgelike, Nodelike, QueryInput, QueryInputItem, ReferenceName } from "./query.types.ts";
export type SlotName = string;
export declare const SLOT_TYPES: readonly ["node", "edge", "unknown"];
export type SlotType = typeof SLOT_TYPES[number];
export type QueryFormat = "single" | "array" | "object";
export type QuerySlots = {
    format: QueryFormat;
    node: Record<SlotName, NodeSlot>;
    edge: Record<SlotName, EdgeSlot>;
    unknown: Record<SlotName, UnknownSlot>;
};
export type Slot = NodeSlot | EdgeSlot | UnknownSlot;
export type NodeSlot = {
    type: "node";
    name: SlotName;
    constraints: {
        instance?: Node;
        class?: Class<Node>;
        edges?: {
            from?: SlotName[];
            to?: SlotName[];
            fromOrTo?: SlotName[];
        };
    };
    outputKeys: string[] | number[];
};
export type EdgeSlot = {
    type: "edge";
    name: SlotName;
    constraints: {
        instance?: Edge;
        class?: Class<Edge>;
        nodes?: {
            from?: SlotName;
            to?: SlotName;
            fromOrTo?: SlotName[];
        };
    };
    outputKeys: string[] | number[];
};
export type UnknownSlot = {
    type: "unknown";
    name: SlotName;
    constraints: {};
    outputKeys: string[] | number[];
};
export declare function parseInput(input: QueryInput): QuerySlots;
export declare function checkIsSingleItem(input: QueryInput): input is QueryInputItem;
export declare function parseItem(item: QueryInputItem, slots: QuerySlots): Slot;
export declare function parseArray(array: QueryInputItem[], slots: QuerySlots): void;
export declare function parseObject(object: Record<string, QueryInputItem>, slots: QuerySlots): void;
export declare function checkIsNodelike(item: Nodelike | Edgelike): item is Nodelike;
export declare function checkIsEdgelike(item: Nodelike | Edgelike): item is Edgelike;
export declare function checkIsReferenceName(item: Nodelike | Edgelike): item is ReferenceName;
export declare function getOppositeSlotType(type: SlotType | undefined): "edge" | "node" | "unknown";
export declare function parseReferenceName(item: ReferenceName, slots: QuerySlots, parent?: {
    slot: Slot;
    direction: EdgeDirection;
}): Slot;
export declare function parseNodelike(item: Nodelike, slots: QuerySlots, parent?: {
    slot: EdgeSlot;
    direction: EdgeDirection;
}): NodeSlot;
export declare function parseEdgelike(item: Edgelike, slots: QuerySlots, parent?: {
    slot: NodeSlot;
    direction: EdgeDirection;
}): EdgeSlot;
export declare function getAllSlots(slots: QuerySlots): Slot[];
export declare function getAllConnectedSlotNames(slot: Slot): SlotName[];
export declare function getSlotByName(slots: QuerySlots, name: SlotName): Slot | undefined;
export declare function getOppositeDirection(direction: EdgeDirection): EdgeDirection;
