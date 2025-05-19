import type { Edge } from "./edge.js";

export class EdgeReference<
	Type extends typeof Edge,
	Name extends string
> {
	#brand = "EdgeReference" as const;

	type: Type;
	name: Name;

	constructor(
		type: Type,
		name: Name
	) {
		this.type = type;
		this.name = name;
	}
}
