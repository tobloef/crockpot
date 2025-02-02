import { CustomError } from "../../utils/errors/custom-error.ts";
import type { PoolName, PoolType } from "../pool.ts";

export class ReferenceMismatchError extends CustomError {
  poolName: PoolName;

  types: { existing: any, new: any };

  constructor(
    poolName: PoolName,
    types: { existing: any, new: any }
  ) {
    super(`Reference ${poolName} is already defined as a ${types.existing}, cannot redefine as a ${types.new}.`);
    this.types = types;
    this.poolName = poolName;
  }
}
