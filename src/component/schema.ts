import type { Component } from "./component.ts";

export type Schemaless = undefined;
export type ComponentSchema<Type = any> = { defaultValue: Type }

export type Value<Schema extends ComponentSchema | Schemaless> = (
  Schema extends ComponentSchema<infer Type>
    ? Type
    : null
  );

export type ComponentValue<Comp extends Component<any>> = (
  Comp extends Component<infer Schema>
    ? Value<Schema>
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

export function schema<Type>(defaultValue: Type): ComponentSchema<Type> {
  return {defaultValue};
}
