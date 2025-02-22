export function* iterableToGenerator(array) {
    for (const item of array) {
        yield item;
    }
}
export function* combineGenerators(...generators) {
    for (const generator of generators) {
        yield* generator;
    }
}
//# sourceMappingURL=generators.js.map