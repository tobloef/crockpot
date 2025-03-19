import type { Class } from "../utils/class.ts";
import { Edge } from "./edge.ts";
import type { Nodelike, ReferenceName } from "../query/run-query.types.ts";
export declare class EdgeQueryItem<ClassType extends Class<Edge> = Class<Edge>> {
    #private;
    class: ClassType;
    excludedClassTypes?: Class<Edge>[];
    constructor(params: {
        class: ClassType;
        excludedClassTypes?: Class<Edge>[];
    });
    excluding(...excludedClassTypes: Class<Edge>[]): EdgeQueryItem<ClassType>;
}
export declare class NamedEdgeQueryItem<ClassType extends Class<Edge> = Class<Edge>, Name extends string = ReferenceName> extends EdgeQueryItem<ClassType> {
    #private;
    name: Name;
    constructor(params: {
        class: ClassType;
        name: Name;
        excludedClassTypes?: Class<Edge>[];
    });
    to<ToItem extends Nodelike>(item: ToItem): NamedRelatedEdgeQueryItem<ClassType, Name, ToItem, Nodelike, Nodelike[]>;
    from<FromItem extends Nodelike>(item: FromItem): NamedRelatedEdgeQueryItem<ClassType, Name, Nodelike, FromItem, Nodelike[]>;
    fromOrTo<FromOrToItems extends Nodelike[]>(...items: FromOrToItems): NamedRelatedEdgeQueryItem<ClassType, Name, Nodelike, Nodelike, FromOrToItems>;
}
export declare class RelatedEdgeQueryItem<ClassType extends Class<Edge> = Class<Edge>, ToItem extends Nodelike = Nodelike, FromItem extends Nodelike = Nodelike, FromOrToItems extends Nodelike[] = Nodelike[]> extends EdgeQueryItem<ClassType> {
    #private;
    toItem?: ToItem;
    fromItem?: FromItem;
    fromOrToItems?: FromOrToItems;
    constructor(params: {
        class: ClassType;
        toItem?: ToItem;
        fromItem?: FromItem;
        fromOrToItems?: FromOrToItems;
        excludedClassTypes?: Class<Edge>[];
    });
    as<Name extends ReferenceName>(name: Name): NamedRelatedEdgeQueryItem<ClassType, Name, ToItem, FromItem, FromOrToItems>;
    to<ToItem extends Nodelike>(item: ToItem): RelatedEdgeQueryItem<ClassType, ToItem, FromItem, FromOrToItems>;
    from<FromItem extends Nodelike>(item: FromItem): RelatedEdgeQueryItem<ClassType, ToItem, FromItem, FromOrToItems>;
}
export declare class NamedRelatedEdgeQueryItem<ClassType extends Class<Edge> = Class<Edge>, Name extends string = ReferenceName, ToItem extends Nodelike = Nodelike, FromItem extends Nodelike = Nodelike, FromOrToItems extends Nodelike[] = Nodelike[]> extends EdgeQueryItem<ClassType> {
    #private;
    name: Name;
    toItem?: ToItem;
    fromItem?: FromItem;
    fromOrToItems?: FromOrToItems;
    constructor(params: {
        class: ClassType;
        name: Name;
        toItem?: ToItem;
        fromItem?: FromItem;
        fromOrToItems?: FromOrToItems;
        excludedClassTypes?: Class<Edge>[];
    });
    to<ToItem extends Nodelike>(item: ToItem): NamedRelatedEdgeQueryItem<ClassType, Name, ToItem, FromItem, FromOrToItems>;
    from<FromItem extends Nodelike>(item: FromItem): NamedRelatedEdgeQueryItem<ClassType, Name, ToItem, FromItem, FromOrToItems>;
}
