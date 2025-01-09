export type Immutable<T> = {
  readonly [K in keyof T]: T[K] extends Function ? T[K] : ImmutableObject<T[K]>;
}

type ImmutableObject<T> = {
  readonly [K in keyof T]: Immutable<T[K]>;
}
