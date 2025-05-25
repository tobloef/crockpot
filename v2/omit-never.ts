export type OmitNever<T> = Pick<T, {
  [Prop in keyof T]: (
    [T[Prop]] extends [never]
      ? never
      : Prop
    )
}[keyof T]>;