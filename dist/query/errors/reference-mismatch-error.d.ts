import { CustomError } from "../../utils/errors/custom-error.ts";
import type { PoolName } from "../pool.ts";
export declare class ReferenceMismatchError extends CustomError {
    poolName: PoolName;
    types: {
        existing: any;
        new: any;
    };
    constructor(poolName: PoolName, types: {
        existing: any;
        new: any;
    });
}
