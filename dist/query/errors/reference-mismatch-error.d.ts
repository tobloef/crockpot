import { CustomError } from "../../utils/errors/custom-error.ts";
export declare class ReferenceMismatchError extends CustomError {
    types: {
        existing: any;
        new: any;
    };
    constructor(types: {
        existing: any;
        new: any;
    });
}
