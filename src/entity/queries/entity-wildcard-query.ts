export class EntityWildcardQuery {
  name?: string;
  isOnce: boolean = false;


  as(name?: string): EntityWildcardQuery {
    this.name = name;
    return this;
  }


  once(): EntityWildcardQuery {
    this.isOnce = true;
    return this;
  }
}
