import type { Class } from '../utils/class.js';
import type { Entity, EntityQuery } from '../entity/index.js';
import type {
  Component,
  ComponentQuery,
  ComponentSchema,
  ComponentWithValue,
} from "../component/index.js";
import type {
  Relationship,
  RelationshipQuery,
  RelationshipWithValue,
} from "../relationship/index.js";
import type { Wildcard } from './wildcard.js';
import type { Not, Or, Optional } from './boolean/index.js';

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
);

export type BooleanQueryPart = (
  | Not<any>
  | Or<any>
  | Optional<any>
);

export type ValuedQueryPart = (
  | Component<ComponentSchema>
  | ComponentQuery<ComponentWithValue>
  | RelationshipQuery<RelationshipWithValue>
)
