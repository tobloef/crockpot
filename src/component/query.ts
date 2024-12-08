import type { Entity } from "../entity/entity.ts";
import type { Immutable } from "../utils/immutable.ts";
import type { Component } from "./component.ts";

export class ComponentQuery<ComponentType extends Component<any>> {
  #component: ComponentType;
  #source?: Entity | string;
  #name?: string;


  constructor(component: ComponentType) {
    this.#component = component;
  }


  get component(): Immutable<ComponentType> {
    return this.#component;
  }


  get source(): Immutable<Entity> | string | undefined {
    return this.#source;
  }


  get name(): string | undefined {
    return this.#name;
  }


  on(source: Entity | string): ComponentQuery<ComponentType> {
    this.#source = source;
    return this;
  }


  as(name: string): ComponentQuery<ComponentType> {
    this.#name = name;
    return this;
  }
}
