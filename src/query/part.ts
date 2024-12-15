import type { Class } from "../utils/class.ts";
import { Entity, EntityWildcardQuery, } from "../entity/index.ts";
import { Component, ComponentQuery, } from "../component/index.ts";
import { Relationship, RelationshipQuery, } from "../relationship/index.ts";
import type { Not, Optional, Or, } from "./boolean/index.ts";

export type QueryPart = (
  | NonBooleanQueryPart
  | BooleanQueryPart
  );

export type NonBooleanQueryPart = (
  | Class<Entity>
  | EntityWildcardQuery
  | Class<Component<any>>
  | Component<any>
  | ComponentQuery<any>
  | Class<Relationship<any>>
  | Relationship<any>
  | RelationshipQuery<any>
  );

export type BooleanQueryPart = (
  | Not<any>
  | Or<any>
  | Optional<any>
  );
