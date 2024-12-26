export type Nullable<T> = (
  T extends Record<string, any>
  ? { [Key in keyof T]: T[Key] | null }
  : T | null
  );
