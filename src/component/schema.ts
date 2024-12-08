import type { Component } from "./component.ts";
import type { Immutable } from "../utils/immutable.js";

export type Schemaless = undefined;

export class Schema<Value = any> {
  readonly #defaultValue: Value;

  constructor(defaultValue: Value) {
    this.#defaultValue = defaultValue;
  }

  get defaultValue(): Immutable<Value> {
    return this.#defaultValue;
  }
}

export type Value<ValueSchema extends Schema | Schemaless> = (
  ValueSchema extends Schema<infer Type>
    ? Type
    : null
  );

export type ComponentValue<Comp extends Component<any>> = (
  Comp extends Component<infer ComponentSchema>
    ? Value<ComponentSchema>
    : never
  );

export type ComponentValues<Components extends Component<any>[] | Record<string, Component<any>>> = (
  Components extends Component<any>[]
    ? ComponentArrayValues<Components>
    : Components extends Record<string, Component<any>>
      ? ComponentObjectValues<Components>
      : never
  );

export type ComponentArrayValues<Components extends Component<any>[]> = (
  Components extends [infer First, ...infer Rest]
    ? First extends Component<any>
      ? Rest extends Component<any>[]
        ? [ComponentValue<First>, ...ComponentArrayValues<Rest>]
        : never
      : never
    : []
  );

export type ComponentObjectValues<Components extends Record<string, Component<any>>> = {
  [Key in keyof Components]: ComponentValue<Components[Key]>;
};

