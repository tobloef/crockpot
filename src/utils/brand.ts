export type Brand<Type, Name extends string> = Type & { __brand: Name; };

export function brand<Type, BrandedType extends Brand<Type, any>>(
  value: Type,
): BrandedType {
  return value as unknown as BrandedType;
}
