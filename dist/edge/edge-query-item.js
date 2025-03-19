import { Edge } from "./edge.js";
export class EdgeQueryItem {
    #brand = "EdgeQueryItem";
    class;
    excludedClassTypes;
    constructor(params) {
        this.class = params.class;
        this.excludedClassTypes = params.excludedClassTypes;
    }
    excluding(...excludedClassTypes) {
        return new EdgeQueryItem({
            class: this.class,
            excludedClassTypes,
        });
    }
}
export class NamedEdgeQueryItem extends EdgeQueryItem {
    #brand = "NamedEdgeQueryItem";
    name;
    constructor(params) {
        super(params);
        this.name = params.name;
    }
    to(item) {
        return new NamedRelatedEdgeQueryItem({
            class: this.class,
            name: this.name,
            toItem: item,
            excludedClassTypes: this.excludedClassTypes,
        });
    }
    from(item) {
        return new NamedRelatedEdgeQueryItem({
            class: this.class,
            name: this.name,
            fromItem: item,
            excludedClassTypes: this.excludedClassTypes,
        });
    }
    fromOrTo(...items) {
        if (items.length > 2) {
            throw new Error(`The "fromOrTo" parameter can only accept up to 2 items, but ${items.length} were given.`);
        }
        return new NamedRelatedEdgeQueryItem({
            class: this.class,
            name: this.name,
            fromOrToItems: items,
            excludedClassTypes: this.excludedClassTypes,
        });
    }
}
export class RelatedEdgeQueryItem extends EdgeQueryItem {
    #brand = "RelatedEdgeQueryItem";
    toItem;
    fromItem;
    fromOrToItems;
    constructor(params) {
        super(params);
        this.toItem = params.toItem;
        this.fromItem = params.fromItem;
        this.fromOrToItems = params.fromOrToItems;
    }
    as(name) {
        return new NamedRelatedEdgeQueryItem({
            class: this.class,
            name,
            toItem: this.toItem,
            fromItem: this.fromItem,
            fromOrToItems: this.fromOrToItems,
            excludedClassTypes: this.excludedClassTypes,
        });
    }
    to(item) {
        return new RelatedEdgeQueryItem({
            class: this.class,
            toItem: item,
            excludedClassTypes: this.excludedClassTypes,
        });
    }
    from(item) {
        return new RelatedEdgeQueryItem({
            class: this.class,
            fromItem: item,
            excludedClassTypes: this.excludedClassTypes,
        });
    }
}
export class NamedRelatedEdgeQueryItem extends EdgeQueryItem {
    #brand = "NamedRelatedEdgeQueryItem";
    name;
    toItem;
    fromItem;
    fromOrToItems;
    constructor(params) {
        super(params);
        this.name = params.name;
        this.toItem = params.toItem;
        this.fromItem = params.fromItem;
        this.fromOrToItems = params.fromOrToItems;
    }
    to(item) {
        return new NamedRelatedEdgeQueryItem({
            class: this.class,
            name: this.name,
            toItem: item,
            excludedClassTypes: this.excludedClassTypes,
        });
    }
    from(item) {
        return new NamedRelatedEdgeQueryItem({
            class: this.class,
            name: this.name,
            fromItem: item,
            excludedClassTypes: this.excludedClassTypes,
        });
    }
}
//# sourceMappingURL=edge-query-item.js.map