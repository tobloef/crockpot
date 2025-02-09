type TypesEqual<T, U> = (T extends U ? U extends T ? true : false : false);
/**
 * Assert that two types are the same.
 * This is a no-op function that only exists for type-checking purposes.
 * The type error will show up for the boolean parameter.
 *
 * @example
 *  assertTypesEqual<A, B>(true); // Assert that A and B are the same type
 *  assertTypesEqual<A, B>(false); // Assert that A and B are not the same type
 *
 * @param {boolean} isEqual
 */
export declare const typesEqual: <Expected, Actual>(isEqual: TypesEqual<Expected, Actual>) => void;
export {};
