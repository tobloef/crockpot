export type Writeable<T> = {
    -readonly [P in keyof T]: T[P];
};
export declare function writeable<T>(value: T): Writeable<T>;
