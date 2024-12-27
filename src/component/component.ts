import { Entity } from "../entity/index.ts";
import { ComponentInstanceQuery } from "./queries/component-instance-query.ts";
import { ComponentWildcardQuery } from "./queries/component-wildcard-query.ts";
import { ComponentWildcardValueQuery } from "./queries/component-wildcard-value-query.js";
import { Relationship } from "../relationship/index.js";


export class Component<
  Value = undefined,
> extends Entity {
  static #brand = "Component" as const;

  relationship?: Relationship<unknown>;


  constructor(name?: string) {
    super(name);
  }


  static override as(name: string) {
    return new ComponentWildcardQuery().as(name);
  }


  static override once() {
    return new ComponentWildcardQuery().once();
  }


  static on(source: ComponentSource) {
    return new ComponentWildcardQuery().on(source);
  }

  static value(): ComponentWildcardValueQuery {
    return new ComponentWildcardValueQuery();
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

export type ComponentSource = string | Entity;

export type ComponentValue<ComponentType extends Component<any>> = (
  ComponentType extends Component<infer ValueType> ? ValueType :
    never
  );

export type ComponentValuePair<
  ComponentType extends Component<any> = Component<any>,
> = [
  component: ComponentType,
  value: ComponentValue<ComponentType>
];
