import { Entity } from "../entity/index.ts";
import { ComponentQuery } from "./query.ts";
import type {
  ComponentSchema,
  Schemaless,
  Value,
} from "./schema.ts";
import type { Immutable } from "../utils/immutable.ts";

export type Tag = Component<Schemaless>;
export type ComponentWithValue = Component<ComponentSchema>;

export type ComponentValuePair<
  Comp extends Component<Schema> = any,
  Schema extends ComponentSchema | Schemaless = any
> = [
  component: Comp,
  value: Value<Schema>
]; // TODO: Try with ComponentValue?

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


  with(value: Value<Schema>): ComponentValuePair<typeof this, Schema> {
    return [this, value];
  }

  destroy() {
    super.destroy();
  }
}
