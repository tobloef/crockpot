import type { QueryInput, QueryArrayInput, QueryObjectInput } from "./input.js";
import type { QueryPart } from "./part.js";
import type { Not, Optional, Or } from "./boolean/index.js";
import type { Wildcard } from "./wildcard.js";
import type { Component, ComponentQuery, Values } from "../component/index.js";
import type { Entity, EntityQuery } from "../entity/index.js";

export type QueryOutput<Input extends QueryInput<QueryPart>> = (
  Input extends QueryPart
    ? ParseQueryPart<Input>
    : Input extends QueryArrayInput<QueryPart>
      ? ParseQueryArrayInput<Input>
      : Input extends QueryObjectInput<QueryPart>
        ? ParseQueryObjectInput<Input>
        : never
);

export type ParseQueryArrayInput<Input extends any[]> = (
  Input extends [infer First, ...infer Rest]
    ? First extends QueryPart
      ? [ParseQueryPart<First>] extends [never]
        ? ParseQueryArrayInput<Rest>
        : [ParseQueryPart<First>, ...ParseQueryArrayInput<Rest>]
      : never
    : []
);

export type ParseQueryObjectInput<Input extends QueryObjectInput<QueryPart>> = {
  [Key in keyof Input]: ParseQueryPart<Input[Key]>;
};

export type ParseQueryPart<Part extends QueryPart> = (
  Part extends Optional<infer Type>
    ? (ParseQueryPart<Type> | undefined)
    : Part extends Not<any>
      ? never
      : Part extends Or<infer Types>
        ? ParseOr<Types> extends undefined
          ? never
          : ParseOr<Types>
        : Part extends ComponentQuery<infer Type>
          ? Type extends Component<infer Schema>
            ? Values<Schema>
            : never
          : Part extends Component<infer Schema>
            ? Values<Schema>
            : Part extends Entity
              ? Entity
              : Part extends Wildcard
                ? Component<any>
                : Part extends EntityQuery
                  ? Entity
                  : never
);

export type ParseOr<Parts extends any[]> = (
  Parts extends [infer First, ...infer Rest]
    ? First extends QueryPart
      ? ParseQueryPart<First> extends never
        ? (undefined | ParseOr<Rest>)
        : (ParseQueryPart<First> | ParseOr<Rest>)
      : never
    : never
);
