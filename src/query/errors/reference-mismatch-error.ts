import { CustomError } from "../../utils/errors/custom-error.ts";
import type { PoolName } from "../pool.ts";

export class ReferenceMismatchError extends CustomError {
  poolName: PoolName;

  types: (
    | { existing: "node", new: "edge" }
    | { existing: "edge", new: "node" }
    );

  constructor(
    poolName: PoolName,
    types: (
      | { existing: "node", new: "edge" }
      | { existing: "edge", new: "node" }
      )
  ) {
    super(`Reference ${poolName} is already defined as a ${types.existing}, cannot redefine as a ${types.new}.`);
    this.types = types;
    this.poolName = poolName;
  }
}
