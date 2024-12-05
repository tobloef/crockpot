import type { Class, Instance } from "../utils/class.ts";

export type ComponentSchema = Record<string, Class<any>>;
export type Schemaless = undefined;

export type Values<Schema extends ComponentSchema | Schemaless> = (
  Schema extends ComponentSchema
    ? { [K in keyof Schema]: Instance<Schema[K]>; }
    : never
);

export type SchemaIfNotSchemaless<Schema extends ComponentSchema | Schemaless> = (
  Schema extends ComponentSchema
    ? [Schema]
    : []
);
