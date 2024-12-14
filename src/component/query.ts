import type { Entity } from "../entity/entity.ts";
import type { Component } from "./component.ts";
import type { Wildcard } from "../query/index.ts";

export type Source = string | Entity | Wildcard;

export class ComponentQuery<ComponentType extends Component<any>> {
  #component: ComponentType;
  #source?: Source;
  #name?: string;
  #isOnce: boolean = false;


  constructor(component: ComponentType) {
    this.#component = component;
  }


  get component(): ComponentType {
    return this.#component;
  }


  get name(): string | undefined {
    return this.#name;
  }


  get source(): Source | undefined {
    return this.#source;
  }


  get isOnce(): boolean {
    return this.#isOnce;
  }


  as(name: string): ComponentQuery<ComponentType> {
    this.#name = name;
    return this;
  }


  on(source: Source): ComponentQuery<ComponentType> {
    this.#source = source;
    return this;
  }

  once(): ComponentQuery<ComponentType> {
    this.#isOnce = true;
    return this;
  }
}
