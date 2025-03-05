import type { QueryInput, QueryOutput } from "./run-query.types.ts";
import type { WithHash } from "./create-outputs.js";

export function* deduplicateOutputs<
  Input extends QueryInput
>(
  outputs: Generator<QueryOutput<Input>>
): Generator<QueryOutput<Input>> {
  const alreadyFoundOutputs = new Set<string>();

  for (const output of outputs) {
    const hash = (output as WithHash).__hash;

    if (alreadyFoundOutputs.has(hash)) {
      continue;
    }

    alreadyFoundOutputs.add(hash);

    yield output;
  }
}
