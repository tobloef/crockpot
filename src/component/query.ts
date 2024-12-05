import type { AnyComponent } from "./component.ts";
import type { Entity } from "../entity/entity.ts";
import type { Immutable } from "../utils/immutable.ts";

export class ComponentQuery<Comp extends AnyComponent> {
  #component: Comp;
  #source?: Entity | string;
  #name?: string;

  constructor(component: Comp) {
    this.#component = component;
  }


  get component(): Immutable<Comp> {
    return this.#component;
  }


  get source(): Immutable<Entity> | string | undefined {
    return this.#source;
  }


  get name(): string | undefined {
    return this.#name;
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
