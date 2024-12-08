import { Entity } from "../entity/index.ts";
import { ComponentQuery } from "./query.ts";
import type { ComponentSchema, Schemaless, Values } from "./schema.ts";
import type { Immutable } from "../utils/immutable.ts";

export type AnyComponent = Component<ComponentSchema | Schemaless>;
export type Tag = Component<Schemaless>;
export type ComponentWithValue = Component<ComponentSchema>;

export type ComponentValuesPair<
  Comp extends Component<Schema>,
  Schema extends ComponentSchema | Schemaless
> = [
  component: Comp,
  values: Values<Schema>
]; // TODO: Try with ComponentValue?

export type AnyComponentValuesPair = ComponentValuesPair<
  Component<ComponentSchema>,
  ComponentSchema
>;

export class Component<
  Schema extends ComponentSchema | Schemaless = Schemaless
> extends Entity {

  #schema: Schema;


  constructor()
  constructor(name: string)
  constructor(schema: Schema)
  constructor(name: string, schema: Schema)
  constructor(name: string | undefined, schema: Schema | undefined)
  constructor(nameOrSchema?: string | Schema, schemaOrUndefined?: Schema) {
    const name = typeof nameOrSchema === "string"
        ? nameOrSchema
        : undefined;
    const schema = typeof nameOrSchema === "string" || nameOrSchema === undefined
      ? schemaOrUndefined
      : nameOrSchema;

    super(name);
    this.#schema = schema as Schema;
  }


  get schema(): Immutable<Schema> {
    return this.#schema;
  }


  on(source: Entity | string): ComponentQuery<typeof this> {
    return new ComponentQuery(this).on(source);
  }


  as(name: string): ComponentQuery<typeof this> {
    return new ComponentQuery(this).as(name);
  }


  with(values: Values<Schema>): ComponentValuesPair<typeof this, Schema> {
    return [this, values];
  }

  destroy() {
    super.destroy();
  }
}
