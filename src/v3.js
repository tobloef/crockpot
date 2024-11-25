import { Component } from "./v2/component/index.js";
import { Relationship } from "./v2/relationship/index.js";
import { World } from "./v2/index.js";
import { Entity } from "./v2/entity/index.js";
import { not, or } from "./v2/query/boolean/index.js";

/** @import { Target } from "./v2/relationship/index.js"; */

class FooComponent extends Component {
  value;

  /**
   * @param {number} value
   */
  constructor(value) {
    super();
    this.value = value;
  }
}

class FooRelation extends Relationship {
  value;

  /**
   * @param {Target} target
   * @param {string} value
   */
  constructor(target, value) {
    super(target);
    this.value = value;
  }
}

const world = new World();

const entity1 = new Entity(
  new FooComponent(1),
);

const entity2 = new Entity(
  new FooRelation(entity1, "foo"),
);

world.add(entity1, entity2);

const results = world.query(
  FooComponent,
  FooRelation.to(FooComponent),
  FooComponent.on("thing"),
  FooRelation.to("thing"),
  not(FooComponent),
  not(FooComponent.on("thing")),
  not(FooRelation.to("thing")),
  not(FooRelation.on("x").to("y")),
  FooRelation.on("x").to("y"),
  or(FooComponent, FooRelation),
  or(FooComponent.on("thing"), FooRelation.on("x").to("y")),
);

const result = results[0];