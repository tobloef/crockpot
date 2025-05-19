import { Edge } from "./edge.js";
import type { NodeReference } from "./node-reference.js";
import type { EdgeReference } from "./edge-reference.js";

export class Node {
	#brand = "Node" as const;

	static as<
		Type extends typeof Node,
		Name extends string
	>(
		this: Type,
		name: Name
	): NodeReference<Type, Name> {
		throw Error();
	}

	static with<Input extends (
		| typeof Edge
		| EdgeReference<any, any>
	)>(
		input: Input
	) {
		throw Error();
	}

	static withAll<Input extends Array<(
		| typeof Edge
	)>>(
		input: Input
	) {
		throw Error();
	}

	static to<Input extends (
		| typeof Node
		| NodeReference<any, any>
	)>(
		input: Input
	) {
		throw Error();
	}

	static toAll<Input extends Array<(
		| typeof Node
		| NodeReference<any, any>
	)>>(
		input: Input
	) {
		throw Error();
	}

	static from<Input extends (
		| typeof Node
		| NodeReference<any, any>
		)>(
		input: Input
	) {
		throw Error();
	}

	static fromAll<Input extends Array<(
		| typeof Node
		| NodeReference<any, any>
	)>>(
		input: Input
	) {
		throw Error();
	}
}
