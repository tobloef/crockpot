import type { Class } from "../utils/class.ts";
import {
  Entity,
  EntityQuery,
} from "../entity/index.ts";
import {
  Component,
  ComponentQuery,
  type ComponentValuePair,
} from "../component/index.ts";
import {
  Relationship,
  RelationshipQuery,
} from "../relationship/index.ts";
import { Wildcard, WildcardQuery } from "./wildcard.ts";
import type {
  Not,
  Optional,
  Or,
} from "./boolean/index.ts";

export type QueryPart = (
  | NonBooleanQueryPart
  | BooleanQueryPart
  );

export type NonBooleanQueryPart = (
  | Class<Entity>
  | EntityQuery
  | Component<any>
  | ComponentQuery<any>
  | Relationship<any>
  | RelationshipQuery<any>
  | Wildcard
  | WildcardQuery
  );

export type BooleanQueryPart = (
  | Not<any>
  | Or<any>
  | Optional<any>
  );
