export function isClassThatExtends(child, parent) {
    return (child === parent ||
        (parent.prototype?.isPrototypeOf(child.prototype) ?? false));
}
//# sourceMappingURL=class.js.map