import { Entity } from "../entity/index.ts";
import { ComponentQuery } from "./query.ts";
import type {
  ComponentValue,
  Schema,
  Schemaless,
  Value,
} from "./schema.ts";
import type { Immutable } from "../utils/immutable.ts";

export type Tag = Component<Schemaless>;
export type ComponentWithValue = Component<Schema>;

export type ComponentValuePair<
  Comp extends Component<any> = any,
> = [
  component: Comp,
  value: ComponentValue<Comp>
];

export class Component<
  ComponentSchema extends Schema | Schemaless = Schemaless
> extends Entity {

  #schema: ComponentSchema;

  static withDefault<ComponentSchema extends Schema>(value: Value<ComponentSchema>) {
    const component = new Component<ComponentSchema>();
    // TODO
    return component;
  };


  constructor();

  constructor(name: string);

  constructor(schema: ComponentSchema);

  constructor(name: string, schema: ComponentSchema);

  constructor(name: string | undefined, schema: ComponentSchema | undefined);

  constructor(nameOrSchema?: string | ComponentSchema, schemaOrUndefined?: ComponentSchema) {
    const name = typeof nameOrSchema === "string"
      ? nameOrSchema
      : undefined;
    const schema = typeof nameOrSchema === "string" || nameOrSchema === undefined
      ? schemaOrUndefined
      : nameOrSchema;

    super(name);
    this.#schema = schema as ComponentSchema;
  }


  get schema(): Immutable<ComponentSchema> {
    return this.#schema;
  }


  on(source: Entity | string): ComponentQuery<typeof this> {
    return new ComponentQuery(this).on(source);
  }


  as(name: string): ComponentQuery<typeof this> {
    return new ComponentQuery(this).as(name);
  }


  with(value: ComponentValue<this>): ComponentValuePair<typeof this> {
    return [this, value];
  }


  destroy() {
    super.destroy();
  }
}
