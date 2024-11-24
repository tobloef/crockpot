import { World } from "./world.js";
import { AnyComponent } from "./components.js";

/** @import {
 *   RefSourceCall,
 *   ComponentSourceCall,
 *   ComponentTypeSourceCall,
 *   EntitySourceCall,
 *   AnyComponentSourceCall,
 * } from "./relations.js"; */

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


const Likes = world.relations.define("Likes", {
  reason: "string",
});

const someRelation = Likes({ reason: "just because" });