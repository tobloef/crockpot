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
import type {
  Component,
  ComponentInstanceQuery,
} from "../component/index.ts";
import type {
  Entity,
  EntityWildcardQuery,
} from "../entity/index.ts";
import {
  Relationship,
  RelationshipInstanceQuery,
} from "../relationship/index.ts";
import type { Class } from "../utils/class.ts";
import type { EntityTypeQuery } from "../entity/queries/entity-type-query.js";
import type { ComponentWildcardQuery } from "../component/queries/component-wildcard-query.js";
import type { ComponentTypeQuery } from "../component/queries/component-type-query.js";
import type { RelationshipTypeQuery } from "../relationship/queries/relationship-type-query.js";

export type QueryOutput<Input extends QueryInput> =
  Input extends QueryPart ? QueryPartOutput<Input> :
  Input extends QueryArrayInput<QueryPart> ? QueryArrayOutput<Input> :
  Input extends QueryObjectInput<QueryPart> ? QueryObjectOutput<Input> :
  never;

export type QueryArrayOutput<Input extends QueryArrayInput<QueryPart>> =
  Input extends [infer First, ...infer Rest]
  ? First extends QueryPart
    ? Rest extends QueryArrayInput<QueryPart>
      ? [QueryPartOutput<First>] extends [never]
        ? QueryArrayOutput<Rest>
        : [QueryPartOutput<First>, ...QueryArrayOutput<Rest>]
      : never
    : never
  : [];

export type QueryObjectOutput<Input extends QueryObjectInput<QueryPart>> = {
  [Key in keyof Input]: QueryPartOutput<Input[Key]>;
};

type QueryPartOutput<Part> =
  Part extends Optional<infer Type> ? (QueryPartOutput<Type> | undefined) :
  Part extends Not<any> ? never :
  Part extends Or<infer Types> ? ParseOr<Types> :
  Part extends RelationshipInstanceQuery<infer RelationshipType> ? RelationshipValue<RelationshipType> :
  Part extends ComponentInstanceQuery<infer ComponentType> ? ComponentValue<ComponentType> :
  Part extends RelationshipTypeQuery ? Relationship<unknown> :
  Part extends ComponentTypeQuery ? Component<unknown> :
  Part extends ComponentWildcardQuery ? unknown :
  Part extends Class<Relationship<infer Value>> ? Value :
  Part extends Class<Component<infer Value>> ? Value :
  Part extends Class<Entity> ? Entity :
  Part extends EntityTypeQuery ? Class<Entity> :
  Part extends EntityWildcardQuery ? Entity :
  Part extends Relationship<infer Value> ? Value :
  Part extends Component<infer Value> ? Value :
  Part extends Entity ? Entity :
  never;

type RelationshipValue<T> = T extends Relationship<infer Value> ? Value : never;
type ComponentValue<T> = T extends Component<infer Value> ? Value : never;

export type ParseOr<Parts extends any[]> =
  Parts extends [infer First, ...infer Rest]
  ? First extends QueryPart
    ? QueryPartOutput<First> extends never
      ? (undefined | ParseOr<Rest>)
      : (QueryPartOutput<First> | ParseOr<Rest>)
    : never
  : never;
