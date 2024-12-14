import type { Entity } from "../entity/index.ts";
import type { Source, Target } from "../relationship/index.ts";

export class Wildcard {
  as(name: string): WildcardQuery {
    return new WildcardQuery().as(name);
  }

  on(source: Entity | string | Wildcard): WildcardQuery {
    return new WildcardQuery().on(source);
  }

  to(target: Entity | string | Wildcard): WildcardQuery {
    return new WildcardQuery().to(target);
  }
}

export class WildcardQuery {
  #source?: Source;
  #target?: Target;
  #name?: string;
  #isOnce: boolean = false;


  get source(): Source | undefined {
    return this.#source;
  }


  get target(): Target | undefined {
    return this.#target;
  }


  get name(): string | undefined {
    return this.#name;
  }

  get isOnce(): boolean {
    return this.#isOnce;
  }


  on(source: Target): WildcardQuery {
    this.#source = source;
    return this;
  }


  as(name: string): WildcardQuery {
    this.#name = name;
    return this;
  }


  to(target: Target): WildcardQuery {
    this.#target = target;
    return this;
  }


  once(): WildcardQuery {
    this.#isOnce = true;
    return this;
  }
}

export const Any = new Wildcard();
