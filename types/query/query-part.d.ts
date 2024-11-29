export type QueryPart = (ComponentType | QueryComponent<any> | RelationshipType | QueryRelationship<any> | Not<any> | Or<any>);
export type NonBooleanQueryPart = (ComponentType | QueryComponent<any> | RelationshipType | QueryRelationship<any>);
import type { ComponentType } from "../component/index.js";
import type { QueryComponent } from "./query-component.js";
import type { RelationshipType } from "../relationship/index.js";
import type { QueryRelationship } from "./query-relationship.js";
import type { Not } from "./boolean/index.js";
import type { Or } from "./boolean/index.js";
