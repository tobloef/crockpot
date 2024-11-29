export class CustomError extends Error {
    /**
     * @param {string} [message]
     * @param {Object} [extra]
     * @param {Error} [extra.cause]
     */
    constructor(message?: string | undefined, extra?: {
        cause?: Error | undefined;
    } | undefined);
}
