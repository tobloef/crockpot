import type { Class, Instance } from "../utils/class.ts";
import type { AnyComponent, Component as ComponentType } from "./component.ts";

export type ComponentSchema = Record<string, Class<any>>;
export type Schemaless = undefined;

export type Value<Schema extends ComponentSchema | Schemaless> = (
  Schema extends ComponentSchema
    ? { [K in keyof Schema]: Instance<Schema[K]>; }
    : null
  );

export type ComponentValue<Component extends AnyComponent> = (
  Component extends ComponentType<infer Schema>
    ? Value<Schema>
    : never
);

export type ComponentValues<Components extends AnyComponent[] | Record<string, AnyComponent>> = (
  Components extends AnyComponent[]
    ? ComponentArrayValues<Components>
    : Components extends Record<string, AnyComponent>
      ? ComponentObjectValues<Components>
      : never
  );

export type ComponentArrayValues<Components extends AnyComponent[]> = (
  Components extends [infer First, ...infer Rest]
    ? First extends AnyComponent
      ? Rest extends AnyComponent[]
        ? [ComponentValue<First>, ...ComponentArrayValues<Rest>]
        : never
      : never
    : []
);

export type ComponentObjectValues<Components extends Record<string, AnyComponent>> = {
  [Key in keyof Components]: ComponentValue<Components[Key]>;
};
