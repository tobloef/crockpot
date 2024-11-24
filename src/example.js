import { World } from "./world.js";
import { AnyComponent } from "./components.js";

const world = new World();

const Position = world.define("Position", {
  x: "number",
  y: "number",
});

const SomeTag = world.define("SomeTag");

console.log(Position.name);

const pos = Position({ x: 12, y: 34 });
// @ts-expect-error
Position({ x: 12, z: 34 })
// @ts-expect-error
SomeTag();

console.log(Position.schema);

console.log("x:", pos.x);

console.log(pos);

// @ts-expect-error
console.log(Position());

const player = world.create(pos, SomeTag);
player.add(pos, SomeTag);

const [position, tag] = player.get(Position, SomeTag);

const refCall = Position("someThing");
const componentCall = Position(pos);
const componentTypeCall = Position(Position);
const entityCall = Position(player);
const anyComponentCall = Position(AnyComponent);