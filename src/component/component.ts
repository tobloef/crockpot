import { Entity } from "../entity/index.ts";
import { ComponentInstanceQuery } from "./queries/component-instance-query.ts";
import type { Wildcard } from "../query/index.ts";
import { ComponentWildcardQuery } from "./queries/component-wildcard-query.ts";
import { ComponentTypeQuery } from "./queries/component-type-query.ts";

export class Component<
  Value = undefined,
> extends Entity {
  static #brand = "Component" as const;

  constructor(name?: string) {
    super(name);
  }


  static override as(name: string) {
    return new ComponentWildcardQuery().as(name);
  }


  static override once() {
    return new ComponentWildcardQuery().once();
  }


  static override type() {
    return new ComponentTypeQuery();
  }


  static on(source: ComponentSource) {
    return new ComponentWildcardQuery().on(source);
  }


  on(source: ComponentSource): ComponentInstanceQuery<typeof this> {
    return new ComponentInstanceQuery(this).on(source);
  }


  withValue(value: ComponentValue<this>): ComponentValuePair<typeof this> {
    return [this, value];
  }


  destroy() {
    super.destroy();
  }
}

export type Tag = Component<undefined>;

export type ComponentSource = string | Entity | Wildcard;

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
