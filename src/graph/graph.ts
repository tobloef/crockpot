import { CustomError } from "../utils/errors/custom-error.ts";
import type { Class, Instance } from "../utils/class.ts";

export type QueryPart = (
  | Class<Node>
  | Class<Edge>
  | NodeWildcardQuery<any>
  | EdgeWildcardQuery<any>
  | OneOfQueryPart
  );

type OneOfQueryPart = OneOf<QueryPart[]>;

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
      : Input extends NodeWildcardQuery<infer NodeType>
        ? NodeType
        : Input extends EdgeWildcardQuery<infer EdgeType>
          ? EdgeType
          : Input extends OneOf<infer Parts>
            ? Parts extends QueryPart[]
              ? ParseOr<Parts>
              : never
            : never
  );

type ParseOr<Parts extends QueryPart[]> =
  Parts extends [infer First, ...infer Rest]
    ? First extends QueryPart
      ? Rest extends QueryPart[]
        ? ParseSingleInput<First> extends never
          ? (undefined | ParseOr<Rest>)
          : (ParseSingleInput<First> | ParseOr<Rest>)
        : never
      : never
    : never;

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

export type WithPart = (
  | Node
  | string
  | OneOf<any>
  | NodeWildcardQuery<any>
  | EdgeWildcardQuery<any>
  )

export class Node {
  static defaultWorld = new World();

  name?: string;

  #world: World;
  #edges: Edge[] = [];

  constructor(options?: NodeOptions) {
    this.name = options?.name;
    this.#world = options?.world ?? Node.defaultWorld;
    this.#world.add(this);
  }

  static as<Type extends Node>(this: Class<Type>, name: string) {
    return new NodeWildcardQuery<Type>(this).as(name);
  }

  static with<Type extends Node>(this: Class<Type>, ...parts: WithPart[]) {
    return new NodeWildcardQuery<Type>(this).with(...parts);
  }

  get world(): World {
    return this.#world;
  }

  get edges(): readonly Edge[] {
    return this.#edges;
  }
}

export type EdgeOptions = NodeOptions;

export const EdgeDirection = {
  OneWay: "one-way",
  TwoWay: "two-way",
} as const;

export type EdgeDirection = typeof EdgeDirection[keyof typeof EdgeDirection];

export type NodePart = (
  | Node
  | string
  | NodeWildcardQuery<any>
  | OneOfNodePart
  );

type OneOfNodePart = OneOf<NodePart[]>;

export class Edge {
  name?: string;

  #from: Node;
  #to: Node;
  #world: World;

  static direction: EdgeDirection = EdgeDirection.TwoWay;

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

  static from<Type extends Edge>(this: Class<Type>, node: NodePart) {
    return new EdgeWildcardQuery<Type>(this).from(node);
  }

  static to<Type extends Edge>(this: Class<Type>, node: NodePart) {
    return new EdgeWildcardQuery<Type>(this).to(node);
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

export class NodeWildcardQuery<Type extends Node> {
  #type: Class<Type>;
  #name?: string;
  #with?: WithPart[];

  constructor(type: Class<Type>) {
    this.#type = type;
  }

  as(name: string): this {
    this.#name = name;
    return this;
  }

  with(...parts: WithPart[]): this {
    this.#with = parts;
    return this;
  }
}

export class EdgeWildcardQuery<Type extends Edge> {
  type: Class<Type>;
  #from?: NodePart;
  #to?: NodePart;

  constructor(type: Class<Type>) {
    this.type = type;
  }

  from(from: NodePart): this {
    this.#from = from;
    return this;
  }

  to(to: NodePart): this {
    this.#to = to;
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

export type OneOf<Parts extends unknown[]> = {
  __or: Parts;
}

export function oneOf<Parts extends unknown[]>(
  ...parts: Parts
): OneOf<Parts> {
  return { __or: parts };
}
