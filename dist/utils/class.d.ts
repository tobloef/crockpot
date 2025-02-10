export type Class<T> = new (...args: any[]) => T;
export type Instance<T extends Class<any>> = T extends new (...args: any[]) => infer R ? R : any;
export declare function isClassThatExtends<Parent extends Class<any>>(child: Class<any>, parent: Parent): child is Parent;
export declare function getClassHierarchy(leafClass: Class<any>): Class<any>[];
