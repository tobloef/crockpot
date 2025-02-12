import { CustomError } from "../../utils/errors/custom-error.ts";
import type { PoolName } from "../pool.ts";

export class ReferenceMismatchError extends CustomError {
  types: { existing: any, new: any };

  constructor(
    types: { existing: any, new: any }
  ) {
    super(`Item already defined as a ${types.existing}, cannot redefine as a ${types.new}.`);
    this.types = types;
  }
}
