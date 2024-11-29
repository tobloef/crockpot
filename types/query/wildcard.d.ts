/** @typedef
 * {(
 *   | AnyEntity
 *   | AnyComponent
 *   | AnyComponentType
 *   | AnyRelation
 *   | AnyRelationType
 *   | Any
 * )} Wildcard */
export const AnyEntity: unique symbol;
export const AnyComponent: unique symbol;
export const AnyComponentType: unique symbol;
export const AnyRelation: unique symbol;
export const AnyRelationType: unique symbol;
export const Any: unique symbol;
export type Wildcard = (typeof AnyEntity | typeof AnyComponent | typeof AnyComponentType | typeof AnyRelation | typeof AnyRelationType | typeof Any);
