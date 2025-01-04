import { CustomError } from "../utils/errors/custom-error.ts";
import type { Class } from "../utils/class.ts";

export type QueryPart = (
  | Class<Node>
  | Class<Edge>
  | NodeWildcardQuery
  );

export type QueryInput = QueryPart[] | Record<string, QueryPart>;

export type QueryOutput<Input extends QueryInput> = (
  Generator<QueryOutputItem<Input>>
  )

export type QueryOutputItem<Input extends QueryInput> = (
  Input extends QueryPart[] ? ParseArrayInput<Input> :
    Input extends Record<string, QueryPart> ? ParseObjectInput<Input> :
      never
  );

type ParseArrayInput<Input extends QueryPart[]> = (
  Input extends [infer First, ...infer Rest]
    ? First extends QueryPart
      ? Rest extends QueryPart[]
        ? [ParseSingleInput<First>, ...ParseArrayInput<Rest>]
        : never
      : never
    : []
  );

type ParseObjectInput<Input extends Record<string, QueryPart>> = (
  { [Key in keyof Input]: ParseSingleInput<Input[Key]> }
  );

type ParseSingleInput<Input extends QueryPart> = (
  Input extends Class<Node>
    ? Input extends Class<infer NodeType>
      ? NodeType
      : never
    : Input extends Class<Edge>
      ? Input extends Class<infer EdgeType>
        ? EdgeType
        : never
      : Input extends NodeWildcardQuery
        ? Node
        : never
  );

export type WorldOptions = {
  name?: string;
  createSemanticGraph?: boolean
};

export class World {
  name?: string;

  #nodes: Node[] = [];
  #edges: Edge[] = [];

  constructor(options?: WorldOptions) {
    this.name = options?.name;
  }

  add(node: Node): void;
  add(edge: Edge): void;
  add(item: Node | Edge): void {
    const list: Array<typeof item> = item instanceof Node
      ? this.#nodes
      : this.#edges;

    if (list.includes(item)) {
      return;
    }

    list.push(item);
  }

  query<Input extends QueryInput>(
    input: Input
  ): QueryOutput<Input> {
    return [] as any;
  }
}

export type NodeOptions = {
  name?: string,
  world?: World,
};

export class Node {
  static defaultWorld = new World();

  name?: string;

  #brand = "node" as const;
  #world: World;
  #edges: Edge[] = [];

  constructor(options?: NodeOptions) {
    this.name = options?.name;
    this.#world = options?.world ?? Node.defaultWorld;
    this.#world.add(this);
  }

  static as(name: string): NodeWildcardQuery {
    return new NodeWildcardQuery().as(name);
  }

  get world(): World {
    return this.#world;
  }

  get edges(): readonly Edge[] {
    return this.#edges;
  }
}

export type EdgeOptions = NodeOptions;

export class Edge {
  name?: string;

  #brand = "edge" as const;
  #from: Node;
  #to: Node;
  #world: World;

  constructor(
    ends: { from: Node, to: Node },
    options?: EdgeOptions,
  ) {
    if (ends.from.world !== ends.to.world) {
      throw new WorldMismatchError(ends.from, ends.to);
    }

    this.name = options?.name;
    this.#from = ends.from;
    this.#to = ends.to;

    this.#world = ends.from.world;
  }

  get world(): World {
    return this.#world;
  }

  get from(): Node {
    return this.#from;
  }

  get to(): Node {
    return this.#to;
  }
}

export class NodeWildcardQuery {
  name?: string;

  as(name: string): NodeWildcardQuery {
    this.name = name;

    return this;
  }
}

export class WorldMismatchError extends CustomError {
  from: Node;
  to: Node;

  constructor(from: Node, to: Node) {
    super(
      `Nodes have mismatching worlds. ` +
      `The from-node "${from.name}" belongs to world "${from.world.name}", ` +
      `but the to-node "${to.name}" belongs to world "${to.world.name}".`
    );

    this.from = from;
    this.to = to;
  }
}

export function query<Input extends QueryPart[]>(
  input: [...Input],
): QueryOutput<Input>;

export function query<Input extends QueryPart[]>(
  world: World,
  input: [...Input],
): QueryOutput<Input>;

export function query<Input extends Record<string, QueryPart>>(
  input: Input,
): QueryOutput<Input>;

export function query<Input extends Record<string, QueryPart>>(
  world: World,
  input: Input,
): QueryOutput<Input>;

export function query<Input extends QueryInput>(
  worldOrInput: World | Input,
  inputOrUndefined?: Input,
): QueryOutput<Input> {
  let world: World;
  let input: Input;

  if (worldOrInput instanceof World) {
    world = worldOrInput;

    if (inputOrUndefined === undefined) {
      throw new InvalidQueryInputError(
        inputOrUndefined,
        "A query input must be provided."
      );
    }

    input = inputOrUndefined;
  } else {
    world = Node.defaultWorld;
    input = worldOrInput;
  }

  return world.query(input);
}

export class InvalidQueryInputError extends CustomError {
  input: unknown;

  constructor(input: unknown, reason?: string) {
    let message = `Invalid query input (${input})`;

    if (reason !== undefined) {
      message += `: ${reason}`;
    }

    if (!message.endsWith(".")) {
      message += ".";
    }

    super(message);

    this.input = input;
  }
}

class TestNode extends Node {}
