import { CustomError } from "../../utils/errors/custom-error.js";
export class ReferenceMismatchError extends CustomError {
    poolName;
    types;
    constructor(poolName, types) {
        super(`Reference "${poolName}" is already defined as a ${types.existing}, cannot redefine as a ${types.new}.`);
        this.types = types;
        this.poolName = poolName;
    }
}
//# sourceMappingURL=reference-mismatch-error.js.map