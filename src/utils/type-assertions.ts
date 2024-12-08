type TypesEqual<T, U> = T extends U ? U extends T ? true : false : false;

export function assertTypesEqual<T, U>(value: TypesEqual<T, U>) {}
