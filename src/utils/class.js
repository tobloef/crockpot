/**
 * @typedef {new (...args: any[]) => T} Class
 * @template {any} T
 */

/**
 * @typedef {T extends new (...args: any[]) => infer R ? R : any} Instance
 * @template {Class<any>} T
 */

export {};