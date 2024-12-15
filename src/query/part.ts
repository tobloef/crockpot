import type { Class } from "../utils/class.ts";
import { Entity, EntityWildcardQuery, } from "../entity/index.ts";
import { Component, ComponentInstanceQuery, } from "../component/index.ts";
import { Relationship, RelationshipInstanceQuery, } from "../relationship/index.ts";
import type { Not, Optional, Or, } from "./boolean/index.ts";

export type QueryPart = (
  | NonBooleanQueryPart
  | BooleanQueryPart
  );

export type NonBooleanQueryPart = (
  | Class<Entity>
  | Entity
  | EntityWildcardQuery
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
  );
