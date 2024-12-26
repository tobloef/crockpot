import type { Entity } from "../entity.ts";

export class EntityInstanceQuery {
  entity: Entity;


  constructor(entity: Entity) {
    this.entity = entity;
  }
}
