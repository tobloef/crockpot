import type {
  QueryInput,
  QueryOutput,
} from "./run-query.types.ts";
import { getOutputHash } from "./create-outputs.ts";


export function* deduplicateOutputs<
  Input extends QueryInput
>(
  outputs: Generator<QueryOutput<Input>>
): Generator<QueryOutput<Input>> {
  const alreadyFoundOutputs = new Set<string>();

  for (const output of outputs) {
    const hash = getOutputHash(output)

    if (alreadyFoundOutputs.has(hash)) {
      continue;
    }

    alreadyFoundOutputs.add(hash);

    yield output;
  }
}
