import type { EdgeReference } from "./edge-reference.js";

export class Edge {
	#brand = "Edge" as const;

	static as<
		Type extends typeof Edge,
		Name extends string
	>(
		this: Type,
		name: Name
	): EdgeReference<Type, Name> {
		throw Error();
	}
}
