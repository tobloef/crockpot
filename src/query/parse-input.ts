import { Node } from "../node/node.ts";
import { type Class, isClassThatExtends } from "../utils/class.ts";
import { Edge, type EdgeDirection } from "../edge/edge.ts";
import type { Edgelike, Nodelike, QueryInput, QueryInputItem, ReferenceName } from "./query.types.ts";
import { assertExhaustive } from "../utils/assert-exhaustive.ts";
import { NamedNodeQueryItem, NamedRelatedNodeQueryItem, NodeQueryItem, RelatedNodeQueryItem } from "../node/node-query-item.ts";
import { EdgeQueryItem, NamedEdgeQueryItem, NamedRelatedEdgeQueryItem, RelatedEdgeQueryItem } from "../edge/edge-query-item.ts";
import { ReferenceMismatchError } from "./errors/reference-mismatch-error.ts";
import { randomString } from "../utils/random-string.ts";

export type SlotName = string;

export const SLOT_TYPES = ["node", "edge", "unknown"] as const;
export type SlotType = typeof SLOT_TYPES[number];

export type QueryFormat = "single" | "array" | "object";

export type QuerySlots = {
  format: QueryFormat,
  node: Record<SlotName, NodeSlot>;
  edge: Record<SlotName, EdgeSlot>;
  unknown: Record<SlotName, UnknownSlot>;
};

export type Slot = NodeSlot | EdgeSlot | UnknownSlot;

export type NodeSlot = {
  type: "node",
  name: SlotName,
  constraints: {
    instance?: Node,
    class?: Class<Node>,
    edges?: {
      // "from", as in "edge is going from this node".
      from?: SlotName[],
      to?: SlotName[],
      fromOrTo?: SlotName[],
    },
  },
  outputKeys: string[] | number[],
};

export type EdgeSlot = {
  type: "edge",
  name: SlotName,
  constraints: {
    instance?: Edge,
    class?: Class<Edge>,
    nodes?: {
      // "from", as in "edge is going from this node".
      from?: SlotName,
      to?: SlotName,
      fromOrTo?: SlotName[],
    }
  },
  outputKeys: string[] | number[],
};

export type UnknownSlot = {
  type: "unknown",
  name: SlotName,
  constraints: {},
  outputKeys: string[] | number[],
};

export function parseInput(
  input: QueryInput
): QuerySlots {
  const isSingleItem = checkIsSingleItem(input);
  const isArray = Array.isArray(input);
  const isObject = !isSingleItem && !isArray;

  const slots: QuerySlots = {
    format: (
      isSingleItem ? "single" :
      isArray ? "array" :
      "object"
    ),
    node: {},
    edge: {},
    unknown: {},
  };

  if (isSingleItem) {
    parseItem(input, slots);
  } else if (isArray) {
    parseArray(input, slots);
  } else if (isObject) {
    parseObject(input, slots);
  }

  inferLeftoverDirections(slots);

  return slots;
}

export function checkIsSingleItem(input: QueryInput): input is QueryInputItem {
  return (
    !Array.isArray(input) &&
    input.constructor.name !== "Object"
  )
}

export function parseItem(
  item: QueryInputItem,
  slots: QuerySlots
): Slot {
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

export function parseArray(
  array: QueryInputItem[],
  slots: QuerySlots
) {
  for (let i = 0; i < array.length; i++) {
    const item = array[i]!;
    const slot = parseItem(item, slots);
    (slot.outputKeys as number[]).push(i);
  }
}

export function parseObject(
  object: Record<string, QueryInputItem>,
  slots: QuerySlots
) {
  for (const [key, item] of Object.entries(object)) {
    const slot = parseItem(item, slots);
    (slot.outputKeys as string[]).push(key);
  }
}

export function checkIsNodelike(
  item: Nodelike | Edgelike,
): item is Nodelike {
  return (
    isClassThatExtends(item as Class<any>, Node) ||
    item instanceof Node ||
    item instanceof NodeQueryItem
  );
}

export function checkIsEdgelike(
  item: Nodelike | Edgelike,
): item is Edgelike {
  return (
    isClassThatExtends(item as Class<any>, Edge) ||
    item instanceof Edge ||
    item instanceof EdgeQueryItem
  );
}

export function checkIsReferenceName(
  item: Nodelike | Edgelike,
): item is ReferenceName {
  return typeof item === "string";
}

function getExistingSlot(slots: QuerySlots, slotName: string) {
  for (const type of SLOT_TYPES) {
    const slot = slots[type][slotName];
    if (slot !== undefined) {
      return { type, slot }
    }
  }
}

export function getOppositeSlotType(
  type: SlotType | undefined,
) {
  switch (type) {
    case "node": return "edge";
    case "edge": return "node";
    default: return "unknown";
  }
}

export function parseReferenceName(
  item: ReferenceName,
  slots: QuerySlots,
  parent?: {
    slot: Slot,
    direction: EdgeDirection,
  }
): Slot {
  const slotName = item;

  const existing = getExistingSlot(slots, slotName);

  const newType = getOppositeSlotType(parent?.slot?.type);

  if (existing?.type === newType) {
    return existing.slot;
  }

  if (newType === "unknown" && existing?.type !== undefined) {
    return existing.slot;
  }

  const isTypesMismatch = (
    (existing?.type === "node" && newType === "edge") ||
    (existing?.type === "edge" && newType === "node")
  );

  if (isTypesMismatch) {
    throw new ReferenceMismatchError(
      { existing: existing?.type, new: newType }
    );
  }

  const newSlot: Slot = existing?.slot ?? {
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

export function parseNodelike(
  item: Nodelike,
  slots: QuerySlots,
  parent?: {
    slot: EdgeSlot,
    direction: EdgeDirection,
  }
): NodeSlot {
  let nodeSlot: NodeSlot;

  if (typeof item === "string") {
    nodeSlot = parseReferenceName(item, slots, parent) as NodeSlot;
  } else if (item instanceof Node) {
    nodeSlot = parseNodeInstance(item, slots);
  } else if (item instanceof NodeQueryItem) {
    nodeSlot = parseNodeQueryItem(item, slots);
  } else {
    nodeSlot = parseNodeClass(item, slots);
  }

  if (parent !== undefined) {
    const edgeSlot = slots.edge[parent.slot.name]!;
    setNodeConstraintsOnEdge(edgeSlot, nodeSlot, parent.direction);
    setEdgeConstraintsOnNode(nodeSlot, edgeSlot, parent.direction);
  }

  return nodeSlot;
}

function parseNodeInstance(
  item: Node,
  slots: QuerySlots
): NodeSlot {
  const slotName = item.id;

  const existingSlot = slots.node[slotName];

  const nodeSlot: NodeSlot = existingSlot ?? {
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

function parseNodeClass(
  item: Class<Node>,
  slots: QuerySlots
): NodeSlot {
  const slotName = `${item.name} (${randomString()})`;

  const existingSlot = slots.node[slotName];

  const nodeSlot: NodeSlot = existingSlot ?? {
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

function parseNodeQueryItem(
  item: NodeQueryItem,
  slots: QuerySlots
): NodeSlot {
  const hasName = (
    item instanceof NamedNodeQueryItem ||
    item instanceof NamedRelatedNodeQueryItem
  );

  const hasRelations = (
    item instanceof RelatedNodeQueryItem ||
    item instanceof NamedRelatedNodeQueryItem
  );

  const slotName = hasName
    ? item.name
    : `node-query (${randomString()})`;

  const existingNodeSlot = slots.node[slotName];
  const existingEdgeSlot = slots.edge[slotName];
  const existingUnknownSlot = slots.unknown[slotName];

  if (existingEdgeSlot !== undefined) {
    throw new ReferenceMismatchError(
      { existing: "edge", new: "node" }
    );
  }

  const nodeSlot: NodeSlot = existingNodeSlot ?? {
    name: slotName,
    type: "node",
    constraints: {},
    outputKeys: [],
  };

  slots.node[slotName] = nodeSlot;

  nodeSlot.constraints.class = pickMostSpecificClass(
    item.class,
    existingNodeSlot?.constraints.class,
  );

  if (existingUnknownSlot !== undefined) {
    (nodeSlot.outputKeys as number[]).push(
      ...existingUnknownSlot.outputKeys as number[]
    );

    delete slots.unknown[slotName];
  }

  if (!hasRelations) {
    return nodeSlot;
  }

  for (const withItem of item.withItems ?? []) {
    parseEdgelike(
      withItem,
      slots,
      { slot: nodeSlot, direction: "fromOrTo" }
    );
  }

  for (const toItem of item.toItems ?? []) {
    const edgeSlotName = `to-edge (${randomString()})`;

    const edgeSlot: EdgeSlot = {
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

    parseNodelike(
      toItem,
      slots,
      { slot: edgeSlot, direction: "to" }
    );
  }

  for (const fromItem of item.fromItems ?? []) {
    const edgeSlotName = `from-edge (${randomString()})`;

    const edgeSlot: EdgeSlot = {
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

    parseNodelike(
      fromItem,
      slots,
      { slot: edgeSlot, direction: "from" }
    );
  }

  for (const fromOrToItem of item.fromOrToItems ?? []) {
    const edgeSlotName = `from-or-to-edge (${randomString()})`;

    const edgeSlot: EdgeSlot = {
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

    parseNodelike(
      fromOrToItem,
      slots,
      { slot: edgeSlot, direction: "fromOrTo" }
    );
  }

  return nodeSlot;
}

export function parseEdgelike(
  item: Edgelike,
  slots: QuerySlots,
  parent?: {
    slot: NodeSlot,
    direction: EdgeDirection,
  }
): EdgeSlot {
  let edgeSlot: EdgeSlot;

  if (typeof item === "string") {
    edgeSlot = parseReferenceName(item, slots, parent) as EdgeSlot;
  } else if (item instanceof Edge) {
    edgeSlot = parseEdgeInstance(item, slots);
  } else if (item instanceof EdgeQueryItem) {
    edgeSlot = parseEdgeQueryItem(item, slots);
  } else {
    edgeSlot = parseEdgeClass(item, slots);
  }

  if (parent !== undefined) {
    const nodeSlot = slots.node[parent.slot.name]!;
    setEdgeConstraintsOnNode(nodeSlot, edgeSlot, parent.direction);
    setNodeConstraintsOnEdge(edgeSlot, nodeSlot, parent.direction);

    if (parent.direction === "fromOrTo") {
      parent.direction = inferParentDirection(item, parent);
    }
  }

  return edgeSlot;
}

function inferParentDirection(
  item: Edgelike,
  parentNode: { direction: EdgeDirection }
): EdgeDirection {
  const hasRelations = (
    item instanceof RelatedEdgeQueryItem ||
    item instanceof NamedRelatedEdgeQueryItem
  );

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

function parseEdgeInstance(
  item: Edge,
  slots: QuerySlots
): EdgeSlot {
  const slotName = item.id;

  const existingSlot = slots.edge[slotName];

  const edgeSlot: EdgeSlot = existingSlot ?? {
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

function parseEdgeClass(
  item: Class<Edge>,
  slots: QuerySlots
): EdgeSlot {
  const slotName = `${item.name} (${randomString()})`;

  const existingSlot = slots.edge[slotName];

  const edgeSlot: EdgeSlot = existingSlot ?? {
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

function parseEdgeQueryItem(
  item: EdgeQueryItem,
  slots: QuerySlots
): EdgeSlot {
  const hasName = (
    item instanceof NamedEdgeQueryItem ||
    item instanceof NamedRelatedEdgeQueryItem
  );

  const hasRelations = (
    item instanceof RelatedEdgeQueryItem ||
    item instanceof NamedRelatedEdgeQueryItem
  );

  const slotName = hasName
    ? item.name
    : `edge-query (${randomString()})`;

  const existingEdgeSlot = slots.edge[slotName];
  const existingNodeSlot = slots.node[slotName];
  const existingUnknownSlot = slots.unknown[slotName];

  if (existingNodeSlot !== undefined) {
    throw new ReferenceMismatchError(
      { existing: "node", new: "edge" }
    );
  }

  const edgeSlot: EdgeSlot = existingEdgeSlot ?? {
    name: slotName,
    type: "edge",
    constraints: {},
    outputKeys: [],
  };

  slots.edge[slotName] = edgeSlot;

  edgeSlot.constraints.class = pickMostSpecificClass(
    item.class,
    existingEdgeSlot?.constraints.class,
  );

  if (existingUnknownSlot !== undefined) {
    (edgeSlot.outputKeys as number[]).push(
      ...existingUnknownSlot.outputKeys as number[]
    );

    delete slots.unknown[slotName];
  }

  if (!hasRelations) {
    return edgeSlot;
  }

  if (item.fromItem !== undefined) {
    parseNodelike(
      item.fromItem,
      slots,
      { slot: edgeSlot, direction: "from" }
    );
  }

  if (item.toItem !== undefined) {
    parseNodelike(
      item.toItem,
      slots,
      { slot: edgeSlot, direction: "to" }
    );
  }

  for (const fromOrToItems of item.fromOrToItems ?? []) {
    parseNodelike(
      fromOrToItems,
      slots,
      { slot: edgeSlot, direction: "fromOrTo" }
    );
  }

  return edgeSlot;
}

function setEdgeConstraintsOnNode(
  nodeSlot: NodeSlot,
  edgeSlot: EdgeSlot,
  parentDirection: EdgeDirection,
) {
  nodeSlot.constraints.edges ??= {};
  nodeSlot.constraints.edges[parentDirection] ??= [];
  nodeSlot.constraints.edges[parentDirection].push(edgeSlot.name);
}

function setNodeConstraintsOnEdge(
  edgeSlot: EdgeSlot,
  nodeSlot: NodeSlot,
  parentDirection: EdgeDirection,
) {
  edgeSlot.constraints.nodes ??= {};

  if (parentDirection === "fromOrTo") {
    if (edgeSlot.constraints.nodes.fromOrTo?.length === 2) {
      throw new Error(`Edge ${edgeSlot.name} cannot have more than two nodes defined.`);
    }

    edgeSlot.constraints.nodes.fromOrTo ??= [];
    edgeSlot.constraints.nodes.fromOrTo.push(nodeSlot.name);
  } else {
    edgeSlot.constraints.nodes[parentDirection] = nodeSlot.name;
  }
}

function pickMostSpecificClass<T>(
  newClass: Class<T>,
  existingClass: Class<T> | undefined,
): Class<T> {
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
  throw new ReferenceMismatchError(
    { existing: existingClass, new: newClass }
  );
}

export function getAllSlots(slots: QuerySlots): Slot[] {
  return SLOT_TYPES
    .map((type) => Object.values(slots[type]))
    .flat();
}

export function getAllConnectedSlotNames(slot: Slot): SlotName[] {
  const slotNames: SlotName[] = [];

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

export function getSlotByName(
  slots: QuerySlots,
  name: SlotName
): Slot | undefined {
  for (const type of SLOT_TYPES) {
    const slot = slots[type][name];
    if (slot !== undefined) {
      return slot;
    }
  }
}

function inferLeftoverDirections(slots: QuerySlots) {
  // TODO: Go through all nodes and edges and see if we can infer any fromOrTo
  //  direction if it has a matching from or to direction pair.
  //  Actually, before doing this, check if we can just do whatever we already
  //  do to infer the direction for examples like A.to(B).
}

export function getOppositeDirection(
  direction: EdgeDirection
): EdgeDirection {
  switch (direction) {
    case "from": return "to";
    case "to": return "from";
    case "fromOrTo": return "fromOrTo";
  }
}
