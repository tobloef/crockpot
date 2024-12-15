import type { Class } from "../utils/class.ts";
import { Entity, EntityWildcardQuery, } from "../entity/index.ts";
import { Component, ComponentInstanceQuery, } from "../component/index.ts";
import { Relationship, RelationshipInstanceQuery, } from "../relationship/index.ts";
import type {
  Equals,
  Not,
  Optional,
  Or,
} from "./boolean/index.ts";
import type { EntityTypeQuery } from "../entity/queries/entity-type-query.js";

export type QueryPart = (
  | NonBooleanQueryPart
  | BooleanQueryPart
  );

export type NonBooleanQueryPart = (
  | Class<Entity>
  | Entity
  | EntityWildcardQuery
  | EntityTypeQuery
  | Class<Component<any>>
  | Component<any>
  | ComponentInstanceQuery<any>
  | Class<Relationship<any>>
  | Relationship<any>
  | RelationshipInstanceQuery<any>
  );

export type BooleanQueryPart = (
  | Not<any>
  | Or<any>
  | Optional<any>
  | Equals
  );
