import { Node } from "../node/node.js";
import { isClassThatExtends } from "../utils/class.js";
import { Edge } from "../edge/edge.js";
import { assertExhaustive } from "../utils/assert-exhaustive.js";
import { NamedNodeQueryItem, NamedRelatedNodeQueryItem, NodeQueryItem, RelatedNodeQueryItem } from "../node/node-query-item.js";
import { EdgeQueryItem, NamedEdgeQueryItem, NamedRelatedEdgeQueryItem, RelatedEdgeQueryItem } from "../edge/edge-query-item.js";
import { ReferenceMismatchError } from "./errors/reference-mismatch-error.js";
import { randomString } from "../utils/random-string.js";
export const SLOT_TYPES = ["node", "edge", "unknown"];
export function parseInput(input) {
    const isSingleItem = checkIsSingleItem(input);
    const isArray = Array.isArray(input);
    const isObject = !isSingleItem && !isArray;
    const slots = {
        format: (isSingleItem ? "single" :
            isArray ? "array" :
                "object"),
        node: {},
        edge: {},
        unknown: {},
    };
    if (isSingleItem) {
        parseItem(input, slots);
    }
    else if (isArray) {
        parseArray(input, slots);
    }
    else if (isObject) {
        parseObject(input, slots);
    }
    inferLeftoverDirections(slots);
    return slots;
}
export function checkIsSingleItem(input) {
    return (!Array.isArray(input) &&
        input.constructor.name !== "Object");
}
export function parseItem(item, slots) {
    if (checkIsReferenceName(item)) {
        return parseReferenceName(item, slots);
    }
    if (checkIsNodelike(item)) {
        return parseNodelike(item, slots);
    }
    if (checkIsEdgelike(item)) {
        return parseEdgelike(item, slots);
    }
    assertExhaustive(item);
}
export function parseArray(array, slots) {
    for (let i = 0; i < array.length; i++) {
        const item = array[i];
        const slot = parseItem(item, slots);
        slot.outputKeys.push(i);
    }
}
export function parseObject(object, slots) {
    for (const [key, item] of Object.entries(object)) {
        const slot = parseItem(item, slots);
        slot.outputKeys.push(key);
    }
}
export function checkIsNodelike(item) {
    return (isClassThatExtends(item, Node) ||
        item instanceof Node ||
        item instanceof NodeQueryItem);
}
export function checkIsEdgelike(item) {
    return (isClassThatExtends(item, Edge) ||
        item instanceof Edge ||
        item instanceof EdgeQueryItem);
}
export function checkIsReferenceName(item) {
    return typeof item === "string";
}
function getExistingSlot(slots, slotName) {
    for (const type of SLOT_TYPES) {
        const slot = slots[type][slotName];
        if (slot !== undefined) {
            return { type, slot };
        }
    }
}
export function getOppositeSlotType(type) {
    switch (type) {
        case "node": return "edge";
        case "edge": return "node";
        default: return "unknown";
    }
}
export function parseReferenceName(item, slots, parent) {
    const slotName = item;
    const existing = getExistingSlot(slots, slotName);
    const newType = getOppositeSlotType(parent?.slot?.type);
    if (existing?.type === newType) {
        return existing.slot;
    }
    if (newType === "unknown" && existing?.type !== undefined) {
        return existing.slot;
    }
    const isTypesMismatch = ((existing?.type === "node" && newType === "edge") ||
        (existing?.type === "edge" && newType === "node"));
    if (isTypesMismatch) {
        throw new ReferenceMismatchError({ existing: existing?.type, new: newType });
    }
    const newSlot = existing?.slot ?? {
        name: slotName,
        type: newType,
        constraints: {},
        outputKeys: [],
    };
    if (existing !== undefined) {
        delete slots[existing.type][slotName];
    }
    slots[newType][slotName] = newSlot;
    return newSlot;
}
export function parseNodelike(item, slots, parent) {
    let nodeSlot;
    if (typeof item === "string") {
        nodeSlot = parseReferenceName(item, slots, parent);
    }
    else if (item instanceof Node) {
        nodeSlot = parseNodeInstance(item, slots);
    }
    else if (item instanceof NodeQueryItem) {
        nodeSlot = parseNodeQueryItem(item, slots);
    }
    else {
        nodeSlot = parseNodeClass(item, slots);
    }
    if (parent !== undefined) {
        const edgeSlot = slots.edge[parent.slot.name];
        setNodeConstraintsOnEdge(edgeSlot, nodeSlot, parent.direction);
        setEdgeConstraintsOnNode(nodeSlot, edgeSlot, parent.direction);
    }
    return nodeSlot;
}
function parseNodeInstance(item, slots) {
    const slotName = item.id;
    const existingSlot = slots.node[slotName];
    const nodeSlot = existingSlot ?? {
        name: slotName,
        type: "node",
        constraints: {
            instance: item,
        },
        outputKeys: [],
    };
    slots.node[slotName] = nodeSlot;
    return nodeSlot;
}
function parseNodeClass(item, slots) {
    const slotName = `${item.name} (${randomString()})`;
    const existingSlot = slots.node[slotName];
    const nodeSlot = existingSlot ?? {
        name: slotName,
        type: "node",
        constraints: {
            class: item,
        },
        outputKeys: [],
    };
    slots.node[slotName] = nodeSlot;
    return nodeSlot;
}
function parseNodeQueryItem(item, slots) {
    const hasName = (item instanceof NamedNodeQueryItem ||
        item instanceof NamedRelatedNodeQueryItem);
    const hasRelations = (item instanceof RelatedNodeQueryItem ||
        item instanceof NamedRelatedNodeQueryItem);
    const slotName = hasName
        ? item.name
        : `node-query (${randomString()})`;
    const existingNodeSlot = slots.node[slotName];
    const existingEdgeSlot = slots.edge[slotName];
    const existingUnknownSlot = slots.unknown[slotName];
    if (existingEdgeSlot !== undefined) {
        throw new ReferenceMismatchError({ existing: "edge", new: "node" });
    }
    const nodeSlot = existingNodeSlot ?? {
        name: slotName,
        type: "node",
        constraints: {},
        outputKeys: [],
    };
    slots.node[slotName] = nodeSlot;
    nodeSlot.constraints.class = pickMostSpecificClass(item.class, existingNodeSlot?.constraints.class);
    if (existingUnknownSlot !== undefined) {
        nodeSlot.outputKeys.push(...existingUnknownSlot.outputKeys);
        delete slots.unknown[slotName];
    }
    if (!hasRelations) {
        return nodeSlot;
    }
    for (const withItem of item.withItems ?? []) {
        parseEdgelike(withItem, slots, { slot: nodeSlot, direction: "fromOrTo" });
    }
    for (const toItem of item.toItems ?? []) {
        const edgeSlotName = `to-edge (${randomString()})`;
        const edgeSlot = {
            name: edgeSlotName,
            type: "edge",
            constraints: {
                nodes: {
                    from: slotName,
                }
            },
            outputKeys: [],
        };
        slots.edge[edgeSlotName] = edgeSlot;
        setEdgeConstraintsOnNode(nodeSlot, edgeSlot, "from");
        parseNodelike(toItem, slots, { slot: edgeSlot, direction: "to" });
    }
    for (const fromItem of item.fromItems ?? []) {
        const edgeSlotName = `from-edge (${randomString()})`;
        const edgeSlot = {
            name: edgeSlotName,
            type: "edge",
            constraints: {
                nodes: {
                    to: slotName,
                }
            },
            outputKeys: [],
        };
        slots.edge[edgeSlotName] = edgeSlot;
        setEdgeConstraintsOnNode(nodeSlot, edgeSlot, "to");
        parseNodelike(fromItem, slots, { slot: edgeSlot, direction: "from" });
    }
    for (const fromOrToItem of item.fromOrToItems ?? []) {
        const edgeSlotName = `from-or-to-edge (${randomString()})`;
        const edgeSlot = {
            name: edgeSlotName,
            type: "edge",
            constraints: {
                nodes: {
                    fromOrTo: [slotName],
                }
            },
            outputKeys: [],
        };
        slots.edge[edgeSlotName] = edgeSlot;
        setEdgeConstraintsOnNode(nodeSlot, edgeSlot, "fromOrTo");
        parseNodelike(fromOrToItem, slots, { slot: edgeSlot, direction: "fromOrTo" });
    }
    return nodeSlot;
}
export function parseEdgelike(item, slots, parent) {
    let edgeSlot;
    if (typeof item === "string") {
        edgeSlot = parseReferenceName(item, slots, parent);
    }
    else if (item instanceof Edge) {
        edgeSlot = parseEdgeInstance(item, slots);
    }
    else if (item instanceof EdgeQueryItem) {
        edgeSlot = parseEdgeQueryItem(item, slots);
    }
    else {
        edgeSlot = parseEdgeClass(item, slots);
    }
    if (parent !== undefined) {
        const nodeSlot = slots.node[parent.slot.name];
        setEdgeConstraintsOnNode(nodeSlot, edgeSlot, parent.direction);
        setNodeConstraintsOnEdge(edgeSlot, nodeSlot, parent.direction);
        if (parent.direction === "fromOrTo") {
            parent.direction = inferParentDirection(item, parent);
        }
    }
    return edgeSlot;
}
function inferParentDirection(item, parentNode) {
    const hasRelations = (item instanceof RelatedEdgeQueryItem ||
        item instanceof NamedRelatedEdgeQueryItem);
    if (!hasRelations) {
        return parentNode.direction;
    }
    const isImplicitlyFrom = item.toItem !== undefined && item.fromItem === undefined;
    const isImplicitlyTo = item.toItem === undefined && item.fromItem !== undefined;
    if (isImplicitlyFrom) {
        return "from";
    }
    if (isImplicitlyTo) {
        return "to";
    }
    return parentNode.direction;
}
function parseEdgeInstance(item, slots) {
    const slotName = item.id;
    const existingSlot = slots.edge[slotName];
    const edgeSlot = existingSlot ?? {
        name: slotName,
        type: "edge",
        constraints: {
            instance: item,
        },
        outputKeys: [],
    };
    slots.edge[slotName] = edgeSlot;
    return edgeSlot;
}
function parseEdgeClass(item, slots) {
    const slotName = `${item.name} (${randomString()})`;
    const existingSlot = slots.edge[slotName];
    const edgeSlot = existingSlot ?? {
        name: slotName,
        type: "edge",
        constraints: {
            class: item,
        },
        outputKeys: [],
    };
    slots.edge[slotName] = edgeSlot;
    return edgeSlot;
}
function parseEdgeQueryItem(item, slots) {
    const hasName = (item instanceof NamedEdgeQueryItem ||
        item instanceof NamedRelatedEdgeQueryItem);
    const hasRelations = (item instanceof RelatedEdgeQueryItem ||
        item instanceof NamedRelatedEdgeQueryItem);
    const slotName = hasName
        ? item.name
        : `edge-query (${randomString()})`;
    const existingEdgeSlot = slots.edge[slotName];
    const existingNodeSlot = slots.node[slotName];
    const existingUnknownSlot = slots.unknown[slotName];
    if (existingNodeSlot !== undefined) {
        throw new ReferenceMismatchError({ existing: "node", new: "edge" });
    }
    const edgeSlot = existingEdgeSlot ?? {
        name: slotName,
        type: "edge",
        constraints: {},
        outputKeys: [],
    };
    slots.edge[slotName] = edgeSlot;
    edgeSlot.constraints.class = pickMostSpecificClass(item.class, existingEdgeSlot?.constraints.class);
    if (existingUnknownSlot !== undefined) {
        edgeSlot.outputKeys.push(...existingUnknownSlot.outputKeys);
        delete slots.unknown[slotName];
    }
    if (!hasRelations) {
        return edgeSlot;
    }
    if (item.fromItem !== undefined) {
        parseNodelike(item.fromItem, slots, { slot: edgeSlot, direction: "from" });
    }
    if (item.toItem !== undefined) {
        parseNodelike(item.toItem, slots, { slot: edgeSlot, direction: "to" });
    }
    for (const fromOrToItems of item.fromOrToItems ?? []) {
        parseNodelike(fromOrToItems, slots, { slot: edgeSlot, direction: "fromOrTo" });
    }
    return edgeSlot;
}
function setEdgeConstraintsOnNode(nodeSlot, edgeSlot, parentDirection) {
    nodeSlot.constraints.edges ??= {};
    nodeSlot.constraints.edges[parentDirection] ??= [];
    nodeSlot.constraints.edges[parentDirection].push(edgeSlot.name);
}
function setNodeConstraintsOnEdge(edgeSlot, nodeSlot, parentDirection) {
    edgeSlot.constraints.nodes ??= {};
    if (parentDirection === "fromOrTo") {
        edgeSlot.constraints.nodes.fromOrTo ??= [];
        edgeSlot.constraints.nodes.fromOrTo.push(nodeSlot.name);
    }
    else {
        edgeSlot.constraints.nodes[parentDirection] = nodeSlot.name;
    }
}
function pickMostSpecificClass(newClass, existingClass) {
    if (existingClass === undefined) {
        return newClass;
    }
    if (isClassThatExtends(newClass, existingClass)) {
        return newClass;
    }
    if (isClassThatExtends(existingClass, newClass)) {
        return existingClass;
    }
    // There is no clear hierarchy between the two classes.
    throw new ReferenceMismatchError({ existing: existingClass, new: newClass });
}
export function getAllSlots(slots) {
    return SLOT_TYPES
        .map((type) => Object.values(slots[type]))
        .flat();
}
export function getAllConnectedSlotNames(slot) {
    const slotNames = [];
    if (slot.type === "edge") {
        if (slot.constraints.nodes?.from !== undefined) {
            slotNames.push(slot.constraints.nodes.from);
        }
        if (slot.constraints.nodes?.to !== undefined) {
            slotNames.push(slot.constraints.nodes.to);
        }
        if (slot.constraints.nodes?.fromOrTo !== undefined) {
            slotNames.push(...slot.constraints.nodes.fromOrTo);
        }
    }
    if (slot.type === "node") {
        if (slot.constraints.edges?.from !== undefined) {
            slotNames.push(...slot.constraints.edges.from);
        }
        if (slot.constraints.edges?.to !== undefined) {
            slotNames.push(...slot.constraints.edges.to);
        }
        if (slot.constraints.edges?.fromOrTo !== undefined) {
            slotNames.push(...slot.constraints.edges.fromOrTo);
        }
    }
    return slotNames;
}
export function getSlotByName(slots, name) {
    for (const type of SLOT_TYPES) {
        const slot = slots[type][name];
        if (slot !== undefined) {
            return slot;
        }
    }
}
function inferLeftoverDirections(slots) {
    for (const edgeSlot of Object.values(slots.edge)) {
        if (edgeSlot.constraints.nodes === undefined) {
            continue;
        }
        const { from, to, fromOrTo } = edgeSlot.constraints.nodes;
        const hasFrom = from !== undefined;
        const hasTo = to !== undefined;
        const hasFromOrTo = fromOrTo !== undefined && fromOrTo.length > 0;
        if (hasFrom && hasTo && hasFromOrTo) {
            return;
        }
        if (hasFrom && hasFromOrTo) {
            if (fromOrTo.length > 1) {
                return;
            }
            const newTo = fromOrTo[0];
            edgeSlot.constraints.nodes.to = newTo;
            delete edgeSlot.constraints.nodes.fromOrTo;
            const nodeSlot = slots.node[newTo];
            const nodeFromOrTo = nodeSlot.constraints.edges.fromOrTo;
            nodeFromOrTo.splice(nodeFromOrTo.indexOf(edgeSlot.name), 1);
            if (nodeFromOrTo.length === 0) {
                delete nodeSlot.constraints.edges.fromOrTo;
            }
            nodeSlot.constraints.edges.to ??= [];
            nodeSlot.constraints.edges.to.push(edgeSlot.name);
        }
        if (hasTo && hasFromOrTo) {
            if (fromOrTo.length > 1) {
                return;
            }
            const newFrom = fromOrTo[0];
            edgeSlot.constraints.nodes.from = newFrom;
            delete edgeSlot.constraints.nodes.fromOrTo;
            const nodeSlot = slots.node[newFrom];
            const nodeFromOrTo = nodeSlot.constraints.edges.fromOrTo;
            nodeFromOrTo.splice(nodeFromOrTo.indexOf(edgeSlot.name), 1);
            if (nodeFromOrTo.length === 0) {
                delete nodeSlot.constraints.edges.fromOrTo;
            }
            nodeSlot.constraints.edges.from ??= [];
            nodeSlot.constraints.edges.from.push(edgeSlot.name);
        }
    }
}
export function getOppositeDirection(direction) {
    switch (direction) {
        case "from": return "to";
        case "to": return "from";
        case "fromOrTo": return "fromOrTo";
    }
}
export function isItemRelatedToSlots(item, slots) {
    const allSlots = getAllSlots(slots);
    const isNode = item instanceof Node;
    const isEdge = item instanceof Edge;
    const itemClass = item.constructor;
    for (const slot of allSlots) {
        if (slot.type === "unknown") {
            return true;
        }
        if (slot.type === "node" && isNode) {
            if (slot.constraints.instance === item) {
                return true;
            }
            if (slot.constraints.class === undefined) {
                return true;
            }
            if (isClassThatExtends(itemClass, slot.constraints.class)) {
                return true;
            }
        }
        if (slot.type === "edge" && isEdge) {
            if (slot.constraints.instance === item) {
                return true;
            }
            if (slot.constraints.class === undefined) {
                return true;
            }
            if (isClassThatExtends(itemClass, slot.constraints.class)) {
                return true;
            }
        }
    }
    return false;
}
//# sourceMappingURL=parse-input.js.map