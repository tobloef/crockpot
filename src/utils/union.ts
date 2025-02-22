export type TuplifyUnion<T, L = LastOf<T>, N = [T] extends [never] ? true : false> =
  true extends N ? [] : [...TuplifyUnion<Exclude<T, L>>, L];

export type LastOf<T> = UnionToIntersection<T extends any ? () => T : never> extends () => (infer R) ? R : never

export type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends ((x: infer I) => void) ? I : never;

export type IsNotUnion<T> = IsUnion<T> extends true ? false : true;
export type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;