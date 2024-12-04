import type { Class } from '../utils/class.js';
import { Entity, EntityQuery } from '../entity/index.js';
import { Component, ComponentQuery } from '../component/index.js';
import { Relationship, RelationshipQuery } from '../relationship/index.js';
import { Wildcard } from './wildcard.js';
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
