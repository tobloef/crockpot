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
import type { EntityTypeQuery } from "../entity/queries/entity-type-query.ts";
import type { ComponentTypeQuery } from "../component/queries/component-type-query.ts";
import type { RelationshipTypeQuery } from "../relationship/queries/relationship-type-query.ts";

export type QueryPart = (
  | NonBooleanQueryPart
  | BooleanQueryPart
  );

export type NonBooleanQueryPart = (
  | Class<Entity>
  | Class<Component<any>>
  | Class<Relationship<any>>
  | Entity
  | Component<any>
  | Relationship<any>
  | EntityWildcardQuery
  | ComponentInstanceQuery<any>
  | RelationshipInstanceQuery<any>
  | EntityTypeQuery
  | ComponentTypeQuery
  | RelationshipTypeQuery
  );

export type BooleanQueryPart = (
  | Not<any>
  | Or<any>
  | Optional<any>
  | Equals
  );
