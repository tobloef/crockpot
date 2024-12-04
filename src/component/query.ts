import type { AnyComponent } from "./component.js";
import type { Entity } from "../entity/entity.js";

export class ComponentQuery<Comp extends AnyComponent> {
  #component: Comp;

  #source?: Entity | string;
  #name?: string;

  constructor(component: Comp) {
    this.#component = component;
  }

  on(source: Entity | string): ComponentQuery<Comp> {
    this.#source = source;
    return this;
  }

  as(name: string): ComponentQuery<Comp> {
    this.#name = name;
    return this;
  }
}
