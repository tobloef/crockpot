import type { Entity } from "../entity.ts";

export class EntityInstanceQuery {
  entity: Entity;
  name?: string;
  isOnce: boolean = false;

  constructor(entity: Entity) {
    this.entity = entity;
  }


  as(name?: string): EntityInstanceQuery {
    this.name = name;
    return this;
  }


  once(): EntityInstanceQuery {
    this.isOnce = true;
    return this;
  }
}
