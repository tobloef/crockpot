import type { GraphNode } from "./node.ts";
import type { OmitNever } from "./omit-never.ts";

export type NodeItem = (
  | typeof GraphNode
  | GraphNode
  );

export type EdgeItem<
  FromNodeKey extends string,
  Type extends typeof GraphEdge | GraphEdge,
  ToNodeKey extends string
> = [
  FromNodeKey,
  Type,
  ToNodeKey
];

export type InputItem<
  NodeKey extends string
> = (
  | NodeItem
  | EdgeItem<NodeKey, typeof GraphEdge | GraphEdge, NodeKey>
)

export type QueryInput<T extends QueryInput<any>> = {
  [Key: string]: InputItem<NodeKeys<T>> | SubQueryInput<T>;
};


export type SubQueryInput<T extends QueryInput<any>> = QueryInput<T>;

type NodeKeys<T extends QueryInput<any>> = KeysAsDotNotation<NodesOnly<T>>;

type NodesOnly<T extends QueryInput<any>> = OmitNever<{
  [Key in keyof T]: (
    T[Key] extends NodeItem
      ? Key
      : T[Key] extends SubQueryInput<any>
        ? {} extends NodesOnly<T[Key]>
          ? never
          : NodesOnly<T[Key]>
        : never
    );
}>

type KeysAsDotNotation<
  T,
  Key extends keyof T = keyof T
> = (
  Key extends string
    ? T extends string
      ? never
      : (
        Key |
        `${Key}.${KeysAsDotNotation<Exclude<T[Key], undefined>>}`
        )
    : never
  );

