import type { Class } from "../utils/class.ts";
import {
  Entity,
  EntityWildcardQuery,
} from "../entity/index.ts";
import {
  Component,
  ComponentInstanceQuery,
} from "../component/index.ts";
import {
  Relationship,
  RelationshipInstanceQuery,
} from "../relationship/index.ts";
import type {
  Equals,
  Not,
  Optional,
  Or,
} from "./boolean/index.ts";
import type { ComponentWildcardQuery } from "../component/queries/component-wildcard-query.js";
import type { RelationshipWildcardQuery } from "../relationship/queries/relationship-wildcard-query.js";
import type { ComponentWildcardValueQuery } from "../component/queries/component-wildcard-value-query.js";
import type { RelationshipWildcardValueQuery } from "../relationship/queries/relationship-wildcard-value-query.js";

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
