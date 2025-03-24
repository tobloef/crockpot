import type { Class } from "../utils/class.ts";
import { Node } from "./node.ts";
import type { Edgelike, Nodelike, ReferenceName } from "../query/run-query.types.ts";
export declare class NodeQueryItem<ClassType extends Class<Node> = Class<Node>> {
    #private;
    class: ClassType;
    excludedClassTypes?: Class<Node>[];
    constructor(params: {
        class: ClassType;
        excludedClassTypes?: Class<Node>[];
    });
    excluding(...excludedClassTypes: Class<Node>[]): NodeQueryItem<ClassType>;
}
export declare class RelatedNodeQueryItem<ClassType extends Class<Node> = Class<Node>, WithItems extends Edgelike[] = Edgelike[], ToItems extends Nodelike[] = Nodelike[], FromItems extends Nodelike[] = Nodelike[], FromOrToItems extends Nodelike[] = Nodelike[]> extends NodeQueryItem<ClassType> {
    #private;
    withItems?: WithItems;
    toItems?: ToItems;
    fromItems?: FromItems;
    fromOrToItems?: FromOrToItems;
    constructor(params: {
        class: ClassType;
        withItems?: WithItems;
        toItems?: ToItems;
        fromItems?: FromItems;
        fromOrToItems?: FromOrToItems;
        excludedClassTypes?: Class<Node>[];
    });
    as<Name extends ReferenceName>(name: Name): NamedRelatedNodeQueryItem<ClassType, Name, WithItems, ToItems, FromItems, FromOrToItems>;
}
export declare class NamedNodeQueryItem<ClassType extends Class<Node> = Class<Node>, Name extends ReferenceName = ReferenceName> extends NodeQueryItem<ClassType> {
    #private;
    name: Name;
    constructor(params: {
        class: ClassType;
        name: Name;
        excludedClassTypes?: Class<Node>[];
    });
    with<WithItems extends Edgelike[]>(...items: WithItems): NamedRelatedNodeQueryItem<ClassType, Name, WithItems, [], [], []>;
    to<ToItems extends Nodelike[]>(...items: ToItems): NamedRelatedNodeQueryItem<ClassType, Name, [], ToItems, [], []>;
    from<FromItems extends Nodelike[]>(...items: FromItems): NamedRelatedNodeQueryItem<ClassType, Name, [], [], FromItems, []>;
    fromOrTo<FromOrToItems extends Nodelike[]>(...items: FromOrToItems): NamedRelatedNodeQueryItem<ClassType, Name, [], [], [], FromOrToItems>;
}
export declare class NamedRelatedNodeQueryItem<ClassType extends Class<Node> = Class<Node>, Name extends ReferenceName = ReferenceName, WithItems extends Edgelike[] = Edgelike[], ToItems extends Nodelike[] = Nodelike[], FromItems extends Nodelike[] = Nodelike[], FromOrToItems extends Nodelike[] = Nodelike[]> extends NodeQueryItem<ClassType> {
    #private;
    name: Name;
    withItems?: WithItems;
    toItems?: ToItems;
    fromItems?: FromItems;
    fromOrToItems?: FromOrToItems;
    constructor(params: {
        class: ClassType;
        name: Name;
        withItems?: WithItems;
        toItems?: ToItems;
        fromItems?: FromItems;
        fromOrToItems?: FromOrToItems;
        excludedClassTypes?: Class<Node>[];
    });
}
