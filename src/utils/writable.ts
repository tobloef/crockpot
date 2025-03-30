export type Writable<T> = { -readonly [P in keyof T]: T[P] };

export function writable<T>(value: T): Writable<T> {
  return value as Writable<T>;
}
