import type { ArrayQueryOutput, QueryInput, QueryOutput } from "./query.types.ts";

export function* deduplicateOutputs<
  Input extends QueryInput
>(
  outputs: Generator<QueryOutput<Input>>
): Generator<QueryOutput<Input>> {
  const alreadyFoundOutputs = new Set<string>();

  for (const output of outputs) {
    const hash = getOutputHash(output);

    if (alreadyFoundOutputs.has(hash)) {
      continue;
    }

    alreadyFoundOutputs.add(hash);

    yield output;
  }
}

function getOutputHash<
  Input extends QueryInput
>(output: QueryOutput<Input>): string {
  if (output.id !== undefined) {
    return output.id;
  }

  const hash = Object.values(output)
    .map((item) => (item as { id: string }).id)
    .join();

  return hash;
}