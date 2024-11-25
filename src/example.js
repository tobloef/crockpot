import { World } from "./world.js";
import { AnyComponent } from "./components.js";

/** @import {
 *   RefSourceCall,
 *   ComponentSourceCall,
 *   ComponentTypeSourceCall,
 *   EntitySourceCall,
 *   AnyComponentSourceCall,
 * } from "./components.js"; */
/** @import { ComponentTargetCall, ComponentTypeTargetCall, EntityTargetCall, RelationTargetCall, RelationTypeTargetCall } from "./relations.js"; */

const world = new World();

const Position = world.define("Position", {
  x: "number",
  y: "number",
});

const SomeTag = world.define("SomeTag");

const tagSchema = SomeTag.schema;

console.log(Position.name);

const positionSchema = Position.schema;

const player = world.create(Position({ x: 12, y: 34 }), SomeTag);
player.add(Position({ x: 12, y: 34 }), Position({ x: 12, y: 34 }));
player.add(SomeTag);

const [position, tag] = player.get(Position, SomeTag);

/** @type {RefSourceCall<any>} */
const refCall = Position("someThing");
/** @type {ComponentSourceCall<any>} */
const componentCall = Position(Position({ x: 12, y: 34 }));
/** @type {ComponentTypeSourceCall<any>} */
const componentTypeCall = Position(Position);
/** @type {EntitySourceCall<any>} */
const entityCall = Position(player);
/** @type {AnyComponentSourceCall<any>} */
const anyComponentCall = Position(AnyComponent);

/**
 * @template T
 * @typedef {{ hej: T }} Test
 */

/** @type {Test<Position>} */
const test = { hej: Position };

const Likes = world.relations.define("Likes", {
  reason: "string",
});

const Has = world.relations.define("Has");

/** @type {ComponentTargetCall<any>} */
// @ts-expect-error
const componentRelation0 = Likes(position);

/** @type {ComponentTargetCall<any>} */
const componentRelation = Likes(position, { reason: "just because" });
/** @type {ComponentTypeTargetCall<any>} */
const componentTypeRelation = Likes(Position, { reason: "just because" });
/** @type {EntityTargetCall<any>} */
const entityRelation = Likes(player, { reason: "just because" });
/** @type {RelationTypeTargetCall<any>} */
const relationTypeRelation = Likes(Likes, { reason: "just because" });
/** @type {RelationTargetCall<any>} */
const relationRelation = Likes(componentRelation, { reason: "just because" });

/** @type {ComponentTargetCall<any>} */
const componentRelation2 = Has(position);
/** @type {ComponentTypeTargetCall<any>} */
const componentTypeRelation2 = Has(Position);
/** @type {EntityTargetCall<any>} */
const entityRelation2 = Has(player);
/** @type {RelationTypeTargetCall<any>} */
const relationTypeRelation2 = Has(Likes);
/** @type {RelationTargetCall<any>} */
const relationRelation2 = Has(componentRelation);
