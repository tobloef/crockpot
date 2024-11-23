/**
 * @typedef {new (...args: any[]) => T} Class
 * @template {any} T
 */

/**
 * @typedef {T extends new (...args: any[]) => infer R ? R : any} Instance
 * @template {Class<any>} T
 */

/**
 * @template {Class<any>} ClassType
 * @template {Function} CallableType
 * @param {ClassType} classType
 * @param {CallableType} callable
 * @returns {ClassType & CallableType}
 */
export function makeClassCallable(classType, callable) {
  const proxy = new Proxy(classType, {
    apply: (target, thisArg, args) => Reflect.apply(callable, thisArg, args),
  });

  return (
    /** @type {ClassType & CallableType} */
    (proxy)
  );
}

/**
 * @returns {new () => {}}
 */
export function createAnonymousClass() {
  return class {};
}

/**
 * @param {string} name
 */
export function createNamedClass(name) {
  const Class = createAnonymousClass();

  assignClassName(Class, name);

  return Class;
}

/**
 * @param {Function} func
 * @param {string} name
 */
export function assignClassName(func, name) {
  Object.defineProperty(func, 'name', { value: name });
}
