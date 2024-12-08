import { Entity } from "../entity/index.ts";
import { ComponentQuery } from "./query.ts";

export class Component<
  Value = undefined,
> extends Entity {

  constructor(name?: string) {
    super(name);
  }


  on(source: Entity | string): ComponentQuery<typeof this> {
    return new ComponentQuery(this).on(source);
  }


  as(name: string): ComponentQuery<typeof this> {
    return new ComponentQuery(this).as(name);
  }


  withValue(value: ComponentValue<this>): ComponentValuePair<typeof this> {
    return [this, value];
  }


  destroy() {
    super.destroy();
  }
}

export type Tag = Component<undefined>;

export type ComponentValue<ComponentType extends Component<any>> = (
  ComponentType extends Component<infer ValueType>
    ? ValueType
    : never
  );

export type ComponentValues<ComponentTypes extends Component<any>[] | Record<string, Component<any>>> = (
  ComponentTypes extends Component<any>[]
    ? ComponentArrayValues<ComponentTypes>
    : ComponentTypes extends Record<string, Component<any>>
      ? ComponentObjectValues<ComponentTypes>
      : never
  );

export type ComponentArrayValues<ComponentTypes extends Component<any>[]> = (
  ComponentTypes extends [infer First, ...infer Rest]
    ? First extends Component<any>
      ? Rest extends Component<any>[]
        ? [ComponentValue<First>, ...ComponentArrayValues<Rest>]
        : never
      : never
    : []
  );

export type ComponentObjectValues<ComponentTypes extends Record<string, Component<any>>> = {
  [Key in keyof ComponentTypes]: ComponentValue<ComponentTypes[Key]>;
};

export type ComponentValuePair<
  ComponentType extends Component<any> = any,
> = [
  component: ComponentType,
  value: ComponentValue<ComponentType>
];
