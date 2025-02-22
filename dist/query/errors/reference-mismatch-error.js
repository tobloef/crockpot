import { CustomError } from "../../utils/errors/custom-error.js";
export class ReferenceMismatchError extends CustomError {
    types;
    constructor(types) {
        super(`Item already defined as a ${types.existing}, cannot redefine as a ${types.new}.`);
        this.types = types;
    }
}
//# sourceMappingURL=reference-mismatch-error.js.map