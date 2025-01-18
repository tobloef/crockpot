export function assertExhaustive(x: never): never {
  throw new Error(`Unexpected object: ${x as unknown as string}`);
}
