export type Class<T> = new (...args: any[]) => T;

export type Instance<T extends Class<any>> = T extends new (...args: any[]) => infer R ? R : any;
