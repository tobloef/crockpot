export function* iterableToGenerator<T>(
  array: Iterable<T>
): Generator<T> {
  for (const item of array) {
    yield item;
  }
}

export function* combineGenerators<T>(
  ...generators: Generator<T>[]
): Generator<T> {
  for (const generator of generators) {
    yield* generator;
  }
}