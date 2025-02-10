export function isClassThatExtends(child, parent) {
    return (child === parent ||
        (parent.prototype?.isPrototypeOf(child.prototype) ?? false));
}
export function getClassHierarchy(leafClass) {
    const hierarchy = [];
    let current = leafClass;
    while (current != null && current.name !== "") {
        hierarchy.push(current);
        current = Object.getPrototypeOf(current);
    }
    return hierarchy;
}
//# sourceMappingURL=class.js.map