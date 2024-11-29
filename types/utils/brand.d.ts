export type Brand<Type, Name extends string> = Type & {
    __brand: Name;
};
