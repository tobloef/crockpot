export type Class<T> = new (...args: any[]) => T;

export type Instance<T extends Class<any>> = T extends new (...args: any[]) => infer R ? R : any;

export function isClassThatExtends<
  Parent extends Class<any>
>(
  child: Class<any>,
  parent: Parent,
): child is Parent {
  return (
    child === parent ||
    (parent.prototype?.isPrototypeOf(child.prototype) ?? false)
  );
}

export function getClassHierarchy(
  leafClass: Class<any>
) {
  const hierarchy: Class<any>[] = [];
  let current = leafClass;

  while (current != null && current.name !== "") {
    hierarchy.push(current);
    current = Object.getPrototypeOf(current);
  }

  return hierarchy;
}