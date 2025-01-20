export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export function writeable<T>(value: T): Writeable<T> {
  return value as Writeable<T>;
}