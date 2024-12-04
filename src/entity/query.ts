export class EntityQuery {
  name?: string;

  as(name?: string): EntityQuery {
    this.name = name;
    return this;
  }
}
