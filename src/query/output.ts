import type { QueryArrayInput, QueryInput, QueryObjectInput, } from "./input.ts";
import type { QueryPart } from "./part.ts";
import type { Not, Optional, Or, } from "./boolean/index.ts";
import type { Component, ComponentInstanceQuery, } from "../component/index.ts";
import type { Entity } from "../entity/index.ts";
import { Relationship, RelationshipInstanceQuery, } from "../relationship/index.ts";
import type { Class } from "../utils/class.ts";
import type { ComponentWildcardQuery } from "../component/queries/component-wildcard-query.ts";
import type { Writeable } from "./pools.ts";
import type { RelationshipWildcardValueQuery } from "../relationship/queries/relationship-wildcard-value-query.ts";
import type { ComponentWildcardValueQuery } from "../component/queries/component-wildcard-value-query.ts";
import type { RelationshipWildcardQuery } from "../relationship/queries/relationship-wildcard-query.ts";
import type { EntityWildcardQuery } from "../entity/queries/entity-wildcard-query.ts";

export type QueryOutput<Input extends QueryInput> = Generator<QueryOutputItem<Input>>;

export type QueryOutputItem<Input extends QueryInput> =
  Input extends QueryPart ? QueryPartOutput<Input> :
    Input extends QueryArrayInput ? QueryArrayOutput<Writeable<Input>> :
      Input extends QueryObjectInput ? QueryObjectOutput<Writeable<Input>> :
        never;

export type QueryArrayOutput<Input extends QueryArrayInput> =
  Input extends [infer First, ...infer Rest]
    ? First extends QueryPart
      ? Rest extends QueryArrayInput
        ? [QueryPartOutput<First>] extends [never]
          ? QueryArrayOutput<Rest>
          : [QueryPartOutput<First>, ...QueryArrayOutput<Rest>]
        : never
      : never
    : [];

export type QueryObjectOutput<Input extends QueryObjectInput> = {
  [Key in keyof Input]: QueryPartOutput<Input[Key]>;
};

export type QueryPartOutput<Part> =
  Part extends Optional<infer Type> ? (QueryPartOutput<Type> | undefined) :
    Part extends Not<any> ? never :
      Part extends Or<infer Types> ? ParseOr<Types> :
        Part extends RelationshipInstanceQuery<infer RelationshipType> ? RelationshipValue<RelationshipType> :
          Part extends ComponentInstanceQuery<infer ComponentType> ? ComponentValue<ComponentType> :
            Part extends RelationshipWildcardValueQuery ? unknown :
              Part extends ComponentWildcardValueQuery ? unknown :
                Part extends RelationshipWildcardQuery ? Relationship<unknown> :
                  Part extends ComponentWildcardQuery ? Component<unknown> :
                    Part extends EntityWildcardQuery ? Entity :
                      Part extends Class<Relationship<any>> ? Relationship<unknown> :
                        Part extends Class<Component<any>> ? Component<unknown> :
                          Part extends Class<Entity> ? Entity :
                            Part extends Relationship<infer Value> ? Value :
                              Part extends Component<infer Value> ? Value :
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
