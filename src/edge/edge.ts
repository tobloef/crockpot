import type { Class } from "../utils/class.ts";
import type {
	Nodelike,
	ReferenceName,
} from "../query/run-query.types.ts";
import { randomString } from "../utils/random-string.ts";
import type { Node } from "../node/node.ts";
import { type Graph } from "../graph.ts";
import { DEFAULT_OPTIONALITY_KEY } from "../query/optional.ts";
import { EdgeQueryItem } from "./edge-query-item.ts";

export class Edge {
	#brand = "Edge" as const;

	static defaultGraph: Graph;

	readonly id: string = randomString();
	graph: Readonly<Graph> = Edge.defaultGraph;


	get nodes(): EdgeNodes {
		return (
			this.graph.indices.nodesByEdge.get(this) ??
			this.#createEmptyNodes()
		);
	}


	static except<
		Type extends Class<Edge>,
	>(
		this: Type,
		...excludedClassTypes: Class<Edge>[]
	) {
		return new EdgeQueryItem<
			Type,
			ReferenceName,
			Nodelike,
			Nodelike,
			Nodelike[],
			boolean
		>({
			class: this,
			excludedClassTypes,
		});
	}


	static optional<
		Type extends Class<Edge>,
	>(
		this: Type,
		optionalityGroup: string = DEFAULT_OPTIONALITY_KEY,
	) {
		return new EdgeQueryItem<
			Type,
			ReferenceName,
			Nodelike,
			Nodelike,
			Nodelike[],
			true
		>({
			class: this,
			optionalityKey: optionalityGroup,
		});
	}


	static as<
		Type extends Class<Edge>,
		Name extends ReferenceName,
	>(
		this: Type,
		name: Name,
	) {
		return new EdgeQueryItem<
			Type,
			Name,
			Nodelike,
			Nodelike,
			Nodelike[],
			boolean
		>({
			class: this,
			name,
		});
	}


	static to<
		Type extends Class<Edge>,
		ToItem extends Nodelike
	>(
		this: Type,
		item: ToItem,
	) {
		return new EdgeQueryItem<
			Type,
			ReferenceName,
			ToItem,
			Nodelike,
			Nodelike[],
			boolean
		>({
			toItem: item,
			class: this,
		});
	}


	static from<
		Type extends Class<Edge>,
		FromItem extends Nodelike
	>(
		this: Type,
		item: FromItem,
	) {
		return new EdgeQueryItem<
			Type,
			ReferenceName,
			Nodelike,
			FromItem,
			Nodelike[],
			boolean
		>({
			fromItem: item,
			class: this,
		});
	}


	static fromOrTo<
		Type extends Class<Edge>,
		FromOrToItems extends Nodelike[]
	>(
		this: Type,
		...items: FromOrToItems
	) {
		return new EdgeQueryItem<
			Type,
			ReferenceName,
			Nodelike,
			Nodelike,
			FromOrToItems,
			boolean
		>({
			fromOrToItems: items,
			class: this,
		});
	}


	replaceNode(
		direction: "to" | "from",
		node: Node,
	) {
		this.graph.removeEdge(this);

		if (direction === "to") {
			this.graph.addEdge({
				to: node,
				from: this.nodes["from"]!,
				edge: this,
			});
		} else {
			this.graph.addEdge({
				to: this.nodes["to"]!,
				from: node,
				edge: this,
			});
		}
	}


	remove(): void {
		this.graph.removeEdge(this);
	}


	#createEmptyNodes(): EdgeNodes {
		return {
			from: undefined,
			to: undefined,
		};
	}
}

export type EdgeNodes = Readonly<{
	from?: Node;
	to?: Node;
}>;

export type EdgeDirection = "from" | "to" | "fromOrTo";
