import type { Class } from "../utils/class.ts";
import { Entity } from "../entity/index.ts";
import { Component, ComponentInstanceQuery, } from "../component/index.ts";
import { Relationship, RelationshipInstanceQuery, } from "../relationship/index.ts";
import type { Equals, Not, Optional, Or, } from "./boolean/index.ts";
import type { ComponentWildcardQuery } from "../component/queries/component-wildcard-query.ts";
import type { RelationshipWildcardQuery } from "../relationship/queries/relationship-wildcard-query.ts";
import type { ComponentWildcardValueQuery } from "../component/queries/component-wildcard-value-query.ts";
import type { RelationshipWildcardValueQuery } from "../relationship/queries/relationship-wildcard-value-query.ts";
import type { EntityWildcardQuery } from "../entity/queries/entity-wildcard-query.ts";

export type QueryPart = (
  | NonBooleanQueryPart
  | BooleanQueryPart
  );

export type NonBooleanQueryPart = (
  | Class<Entity>
  | Class<Component<any>>
  | Class<Relationship<any>>
  | Component<any>
  | Relationship<any>
  | EntityWildcardQuery
  | ComponentWildcardQuery
  | RelationshipWildcardQuery
  | ComponentWildcardValueQuery
  | RelationshipWildcardValueQuery
  | ComponentInstanceQuery<any>
  | RelationshipInstanceQuery<any>
  );

export type BooleanQueryPart = (
  | Not<any>
  | Or<any>
  | Optional<any>
  | Equals
  );
