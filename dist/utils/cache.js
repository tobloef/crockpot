export function cache(fn) {
    const cache = new WeakMap();
    return (input) => {
        if (cache.has(input)) {
            return cache.get(input);
        }
        const output = fn(input);
        cache.set(input, output);
        return output;
    };
}
export function cacheAsync(fn) {
    const cache = new WeakMap();
    return async (input) => {
        if (cache.has(input)) {
            return cache.get(input);
        }
        const output = await fn(input);
        cache.set(input, output);
        return output;
    };
}
//# sourceMappingURL=cache.js.map