export function cache<Input extends WeakKey, Output>(
  fn: (input: Input) => Output
): (input: Input) => Output {
  const cache = new WeakMap<Input, Output>();

  return (input: Input) => {
    if (cache.has(input)) {
      return cache.get(input)!;
    }

    const output = fn(input);
    cache.set(input, output);

    return output;
  }
}

export function cacheAsync<Input extends WeakKey, Output>(
  fn: (input: Input) => Promise<Output>
): (input: Input) => Promise<Output> {
  const cache = new WeakMap<Input, Output>();

  return async (input: Input) => {
    if (cache.has(input)) {
      return cache.get(input)!;
    }

    const output = await fn(input);
    cache.set(input, output);

    return output;
  }
}