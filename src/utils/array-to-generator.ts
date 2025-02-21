export function* arrayToGenerator<T>(
  array: T[]
): Generator<T> {
  for (const item of array) {
    yield item;
  }
}