import type {
  QueryArrayInput,
  QueryInput,
  QueryObjectInput,
} from "./input.ts";
import type { QueryPart } from "./part.ts";
import type {
  Not,
  Optional,
  Or,
} from "./boolean/index.ts";
import { type Wildcard, WildcardQuery } from "./wildcard.ts";
import type {
  Component,
  ComponentQuery,
} from "../component/index.ts";
import type {
  Entity,
  EntityQuery,
} from "../entity/index.ts";
import { Relationship, RelationshipQuery } from "../relationship/index.ts";

export type QueryOutput<Input extends QueryInput> = (
  Input extends QueryPart
    ? QueryPartOutput<Input>
    : Input extends QueryArrayInput<QueryPart>
      ? QueryArrayOutput<Input>
      : Input extends QueryObjectInput<QueryPart>
        ? QueryObjectOutput<Input>
        : never
  );

export type QueryArrayOutput<Input extends QueryArrayInput<QueryPart>> = (
  Input extends [infer First, ...infer Rest]
    ? First extends QueryPart
      ? Rest extends QueryArrayInput<QueryPart>
        ? [QueryPartOutput<First>] extends [never]
          ? QueryArrayOutput<Rest>
          : [QueryPartOutput<First>, ...QueryArrayOutput<Rest>]
        : never
      : never
    : []
  );

export type QueryObjectOutput<Input extends QueryObjectInput<QueryPart>> = {
  [Key in keyof Input]: QueryPartOutput<Input[Key]>;
};

export type QueryPartOutput<Part extends QueryPart> = (
  Part extends Entity
    ? Entity
    : never
);

export type QueryPartOutputReal<Part extends QueryPart> = (
  Part extends Optional<infer Type>
    ? (QueryPartOutput<Type> | undefined)
    : Part extends Not<any>
      ? never
      : Part extends Or<infer Types>
        ? ParseOr<Types>
        : Part extends ComponentQuery<infer ComponentType>
          ? ComponentType extends Component<infer Value>
            ? Value
            : never
          : Part extends RelationshipQuery<infer RelationshipType>
            ? RelationshipType extends Relationship<infer Value>
              ? Value
              : never
            : Part extends Component<infer Value>
              ? Value
              : Part extends Relationship<infer Value>
                ? Value
                : Part extends WildcardQuery
                  ? Entity
                  : Part extends Wildcard
                    ? Entity
                    : Part extends EntityQuery
                      ? Entity
                      : Part extends Entity
                        ? Entity
                        : never
);

export type ParseOr<Parts extends any[]> = (
  Parts extends [infer First, ...infer Rest]
    ? First extends QueryPart
      ? QueryPartOutput<First> extends never
        ? (undefined | ParseOr<Rest>)
        : (QueryPartOutput<First> | ParseOr<Rest>)
      : never
    : never
  );
