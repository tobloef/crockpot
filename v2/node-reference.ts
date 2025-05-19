import type { Node } from "./node.js";
import { Edge } from "./edge.js";
import type { EdgeReference } from "./edge-reference.js";

export class NodeReference<
	Type extends typeof Node,
	Name extends string
> {
	#brand = "NodeReference" as const;

	type: Type;
	name: Name;

	constructor(
		type: Type,
		name: Name
	) {
		this.type = type;
		this.name = name;
	}

	with<Input extends (
		| typeof Edge
		| EdgeReference<any, any>
		)>(
		input: Input
	) {
		throw Error();
	}

	withAll<Input extends Array<(
		| typeof Edge
		| EdgeReference<any, any>
		)>>(
		input: Input
	) {
		throw Error();
	}

	to<Input extends (
		| typeof Node
		| NodeReference<any, any>
		)>(
		input: Input
	) {
		throw Error();
	}

	toAll<Input extends Array<(
		| typeof Node
		| NodeReference<any, any>
		)>>(
		input: Input
	) {
		throw Error();
	}

	from<Input extends (
		| typeof Node
		| NodeReference<any, any>
		)>(
		input: Input
	) {
		throw Error();
	}

	fromAll<Input extends Array<(
		| typeof Node
		| NodeReference<any, any>
		)>>(
		input: Input
	) {
		throw Error();
	}
}
