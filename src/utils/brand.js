/**
 * @template Type
 * @template {string} Name
 * @typedef {Type & { __brand: Name }} Brand
 */

/**
 * @template Type
 * @template {Brand<Type, any>} BrandedType
 * @param {Type} value
 * @returns {BrandedType}
 */
export function brand(value) {
  return (
    /** @type {BrandedType} */
    (
      /** @type {unknown} */
      (value)
    )
  );
}

export {};