export declare function cache<Input extends WeakKey, Output>(fn: (input: Input) => Output): (input: Input) => Output;
export declare function cacheAsync<Input extends WeakKey, Output>(fn: (input: Input) => Promise<Output>): (input: Input) => Promise<Output>;
