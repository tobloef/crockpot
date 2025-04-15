import { match } from "node:assert";

type NodeQueryItem = {};
type EdgeQueryItem = {};

type NodeRefDef<
	Type extends NodeType,
	Name extends string,
> = {
	type: Type,
	name: Name,
};

type EdgeRefDef<
	Type extends NodeType,
	Name extends string,
> = {
	type: Type,
	name: Name,
};

type NodeRefUse<ValidName extends string> = ValidName;
type EdgeRefUse<ValidName extends string> = ValidName;

const from = Symbol("from");
const to = Symbol("to");
const fromOrTo = Symbol("from or to");

type EdgeDirection = (
	| typeof from
	| typeof to
	| typeof fromOrTo
)

type ExtractNames<Refs extends NodeRefDef<any, string>> = (
	| Refs extends NodeRefDef<any, infer Name> ? Name : never
)

class Node {
	static with<
		ExistingRefs extends NoInfer<NodeRefDef<any, NoInfer<string>>>,
		NewRefs extends NoInfer<NodeRefDef<any, NoInfer<string>>>,
	>(
		edgeType: EdgeType,
		direction: EdgeDirection,
		otherNode: NoInfer<NewRefs> | NoInfer<NodeRefUse<ExtractNames<ExistingRefs | NewRefs>>>
	): NodeQueryItem {
		return {};
	}
}

class Edge {}

type NodeType = typeof Node;
type EdgeType = typeof Edge;

type QueryInput = {};
type QueryOutput = {};

type MatchInput = (
	| NodeType
	| EdgeType
	| NodeRefDef
	| EdgeRefDef
	| NodeRefUse
	| EdgeRefUse
	| NodeQueryItem
	| EdgeQueryItem
);

export class Graph {
	match<Input extends MatchInput>(input: Input): Query<Input> {

	}
}

class Query<Input extends QueryInput> {
	match(): Query {

	}

	optional(): Query {

	}

	where(): Query {

	}

	return(): Query {

	}

	orderBy(): Query {

	}

	cache(): Query {

	}

	run(): QueryOutput[] {

	}

	additions(): QueryOutput[] {

	}

	removals(): QueryOutput[] {

	}

	onAdded(callback: OnAddedCallback): void {

	}

	onRemoved(callback: OnRemovedCallback): void {

	}
}

////////////////////////////////////////////////////////////////

class A extends Node {}
class B extends Node {}

const graph = new Graph();
A.with(Edge, to, "foo");
