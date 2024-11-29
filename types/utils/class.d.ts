/**
 * @typedef {new (...args: any[]) => T} Class
 * @template {any} T
 */
/**
 * @typedef {T extends new (...args: any[]) => infer R ? R : any} Instance
 * @template {Class<any>} T
 */
/**
 * @template {any[]} T
 * @typedef {{
 *   [K in keyof T]: T[K] extends Class<any> ? Instance<T[K]> : T[K]
 * }} ClassesToInstances
 */
/**
 * @template {Class<any>} ClassType
 * @template {Function} CallableType
 * @param {ClassType} classType
 * @param {CallableType} callable
 * @returns {ClassType & CallableType}
 */
export function makeClassCallable<ClassType extends Class<any>, CallableType extends Function>(classType: ClassType, callable: CallableType): ClassType & CallableType;
/**
 * @returns {new () => {}}
 */
export function createAnonymousClass(): new () => {};
/**
 * @param {string} name
 */
export function createNamedClass(name: string): new () => {};
/**
 * @param {Function} func
 * @param {string} name
 */
export function assignClassName(func: Function, name: string): void;
export type Class<T extends unknown> = new (...args: any[]) => T;
export type Instance<T extends Class<any>> = T extends new (...args: any[]) => infer R ? R : any;
export type ClassesToInstances<T extends any[]> = { [K in keyof T]: T[K] extends Class<any> ? Instance<T[K]> : T[K]; };
