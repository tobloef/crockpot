export type QueryResult<QueryParts extends QueryPart[]> = Array<{
    entity: Entity;
    components: ClassesToInstances<ParseQueryParts<QueryParts>>;
}>;
export type ParseQueryParts<QueryParts extends any[]> = (QueryParts extends [infer First, ...infer Rest] ? First extends QueryPart ? [ParseQueryPart<First>] extends [never] ? ParseQueryParts<Rest> : [ParseQueryPart<First>, ...ParseQueryParts<Rest>] : never : []);
export type ParseQueryPart<Part extends QueryPart> = (Part extends Not<any> ? never : Part extends Or<infer Types> ? ParseQueryPart<Types[number]> : Part extends ComponentType ? Part : Part extends QueryComponent<infer Type> ? Type : Part extends RelationshipType ? Part : Part extends QueryRelationship<infer Type> ? Type : never);
import type { QueryPart } from "./query-part.js";
import type { Entity } from "../entity/index.js";
import type { ClassesToInstances } from "../utils/class.js";
import type { Not } from "./boolean/index.js";
import type { Or } from "./boolean/index.js";
import type { ComponentType } from "../component/index.js";
import type { QueryComponent } from "./query-component.js";
import type { RelationshipType } from "../relationship/index.js";
import type { QueryRelationship } from "./query-relationship.js";
